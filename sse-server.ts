import express from "express";
import http from 'http';
import cors from 'cors';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
    StreamableHTTPServerTransport, 
    StreamableHTTPServerTransportOptions 
} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get timeout from environment variable or use default
const requestTimeoutMs = process.env.MCP_TIMEOUT ? parseInt(process.env.MCP_TIMEOUT, 10) : 180000; // 3 minutes for regular requests
const sseConnectionTimeoutMs = process.env.SSE_TIMEOUT ? parseInt(process.env.SSE_TIMEOUT, 10) : 1800000; // 30 minutes for SSE connections
const corsAllowOrigin = process.env.CORS_ALLOW_ORIGIN ?? '*';

// Configure logging based on environment variable
const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info';
const logLevels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

// Custom logger with level filtering
const logger = {
    debug: (...args: any[]) => {
        if (logLevels[LOG_LEVEL as keyof typeof logLevels] <= logLevels.debug) {
            console.debug('[DEBUG]', ...args);
        }
    },
    info: (...args: any[]) => {
        if (logLevels[LOG_LEVEL as keyof typeof logLevels] <= logLevels.info) {
            console.info('[INFO]', ...args);
        }
    },
    warn: (...args: any[]) => {
        if (logLevels[LOG_LEVEL as keyof typeof logLevels] <= logLevels.warn) {
            console.warn('[WARN]', ...args);
        }
    },
    error: (...args: any[]) => {
        if (logLevels[LOG_LEVEL as keyof typeof logLevels] <= logLevels.error) {
            console.error('[ERROR]', ...args);
        }
    }
};

const sseTransports: Record<string, { transport: SSEServerTransport, res: express.Response }> = {};

export function closeAllSseConnections() {
    logger.info(`Closing all active SSE connections (${Object.keys(sseTransports).length})...`);
    for (const sessionId in sseTransports) {
        const { res } = sseTransports[sessionId];
        try {
            if (!res.writableEnded) {
                // Send a custom event to notify the client of the shutdown
                res.write('event: server-shutdown\n');
                res.write('data: {"message": "Server is shutting down. Please reconnect."}\n\n');
                
                // End the response stream
                res.end();
                logger.info(`Closed SSE connection for session: ${sessionId}`);
            }
        } catch (error) {
            logger.error(`Error closing SSE connection for session ${sessionId}:`, error);
        }
    }
}

export function createSseServer(mcpServer: McpServer, port: number = 8080): http.Server {
    const app = express();

    // Enable CORS for all routes
    app.use(cors({
        origin: corsAllowOrigin, // Use environment variable
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }));
    
    logger.info(`CORS configured with origin: ${corsAllowOrigin}`);

    // Parse JSON requests with increased limit
    app.use(express.json({ limit: '300mb' }));
    
    // Add basic health check endpoint
    app.get('/health', (req: express.Request, res: express.Response) => {
        res.status(200).json({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            serverName: 'mcp-sse-github'
        });
    });

    // --- Configuration for StreamableHTTPServerTransport ---
    const streamableTransportOptions: StreamableHTTPServerTransportOptions = {
        sessionIdGenerator: () => randomUUID(),
        // Optional: callback for when a session is initialized
        onsessioninitialized: (sessionId) => {
          logger.info(`Streamable HTTP session initialized: ${sessionId}`);
        },
    };

    const mcpStreamableTransport = new StreamableHTTPServerTransport(streamableTransportOptions);

    // Connect the McpServer to the Streamable transport once.
    // This allows the McpServer to send messages through this transport.
    mcpServer.connect(mcpStreamableTransport).catch(error => {
        logger.error("Failed to connect McpServer to StreamableHTTPServerTransport:", error);
    });

    // Modern endpoint for Streamable HTTP
    app.all('/mcp', (req: express.Request, res: express.Response) => {
        logger.debug(`New Streamable HTTP request: ${req.method} ${req.url}`);
        
        // Handle preflight OPTIONS requests for CORS
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }
        
        // Set a timeout for the request
        const requestTimeout = setTimeout(() => {
            if (!res.writableEnded) {
                logger.error(`Request timeout for ${req.url}`);
                res.status(408).json({
                    error: 'Request timeout',
                    message: 'The request took too long to process'
                });
            }
        }, requestTimeoutMs); // Use timeout from environment variable
        
        // req.body is parsed by express.json() if Content-Type is application/json
        mcpStreamableTransport.handleRequest(req, res, req.body)
            .then(() => {
                clearTimeout(requestTimeout);
            })
            .catch((error) => {
                clearTimeout(requestTimeout);
                logger.error(`Error handling Streamable HTTP request for ${req.url}:`, error);
                if (!res.writableEnded) {
                    res.status(500).json({
                        error: 'Error processing Streamable HTTP request',
                        message: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            });
    });

    // --- Configuration for SSEServerTransport (legacy) ---
    // Legacy SSE endpoint for older clients (establish connection)
    app.get('/sse', (req: express.Request, res: express.Response) => {
        logger.info('New SSE connection request');

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering if behind nginx

        const transport = new SSEServerTransport('/messages', res); 
        
        // Set a connection timeout
        const connectionTimeout = setTimeout(() => {
            if (!res.writableEnded) {
                logger.error('SSE connection timeout');
                res.status(408).send('Connection timeout');
            }
        }, sseConnectionTimeoutMs); // Use long timeout for SSE connections
        
        // For SSE, we connect the McpServer to each individual transport when established
        mcpServer.connect(transport).then(() => {
            clearTimeout(connectionTimeout);
            sseTransports[transport.sessionId] = { transport, res };
            logger.info(`SSE connection established: ${transport.sessionId}`);

            // Set up a heartbeat to keep the connection alive
            const heartbeatInterval = setInterval(() => {
                if (res.writableEnded) {
                    clearInterval(heartbeatInterval);
                    return;
                }
                logger.debug(`Sending heartbeat to session ${transport.sessionId}`);
                res.write(': heartbeat\n\n');
            }, 10000); // Send a heartbeat every 10 seconds
                        
            req.on('close', () => {
                clearInterval(heartbeatInterval); // Stop the heartbeat when the connection closes
                logger.warn(`SSE connection closed for session: ${transport.sessionId}. Request aborted: ${req.aborted}`);
                delete sseTransports[transport.sessionId];
            });
        }).catch((error) => {
            clearTimeout(connectionTimeout);
            logger.error(`Error connecting MCP Server for SSE: ${error}`);
            if (!res.writableEnded) {
                res.status(500).send('MCP Server connection error for SSE');
            }
        });
    });

    // Legacy message endpoint for older clients (send messages to the server via SSE)
    app.post('/messages', (req: express.Request, res: express.Response) => {
        const sessionId = req.query.sessionId as string;

        if (!sessionId) {
            logger.error('POST /messages error: Missing sessionId parameter');
            res.status(400).json({
                error: 'Missing sessionId parameter',
                message: 'The sessionId query parameter is required'
            });
            return;
        }

        const session = sseTransports[sessionId];
        if (!session) {
            logger.error(`POST /messages error: Session not found for ID ${sessionId}`);
            res.status(404).json({
                error: 'Session not found',
                message: `No active session found with ID: ${sessionId}`
            });
            return;
        }
        
        let bodyContent: string;
        if (typeof req.body === 'string') {
            bodyContent = req.body;
        } else if (Buffer.isBuffer(req.body)) {
            bodyContent = req.body.toString('utf-8');
        } else if (typeof req.body === 'object' && req.body !== null) {
            // express.json() already parsed the body if it was JSON.
            // SSEServerTransport.handlePostMessage expects the body as a string.
            bodyContent = JSON.stringify(req.body);
        } else {
            logger.warn(`POST /messages for session ${sessionId}: req.body is not a string, buffer, or parsable object. Type: ${typeof req.body}`);
            bodyContent = ''; 
        }

        logger.debug(`Processing message for session ${sessionId}, body length: ${bodyContent.length} bytes`);
        
        // Set a timeout for message processing
        const messageTimeout = setTimeout(() => {
            if (!res.writableEnded) {
                logger.error(`Message processing timeout for session ${sessionId}`);
                res.status(408).json({
                    error: 'Request timeout',
                    message: 'The message took too long to process'
                });
            }
        }, requestTimeoutMs); // Use timeout from environment variable
        
        session.transport.handlePostMessage(req, res, bodyContent)
            .then(() => {
                clearTimeout(messageTimeout);
            })
            .catch((error) => {
                clearTimeout(messageTimeout);
            logger.error(`Error in transport.handlePostMessage for session ${sessionId}:`, error);
            if (!res.writableEnded) {
                res.status(500).json({
                    error: 'Internal server error',
                    message: error instanceof Error ? error.message : 'Unknown error handling SSE message'
                });
            }
        });
    });
    
    // Middleware for handling not found routes (404)
    app.use((req: express.Request, res: express.Response) => {
        logger.debug(`Unhandled request: ${req.method} ${req.url}`);
        res.status(404).json({
            error: 'Not found',
            message: `The requested endpoint ${req.method} ${req.url} does not exist`
        });
    });

    const httpServer = http.createServer(app);

    // Set a longer timeout for the HTTP server to prevent timeouts for long-lived SSE connections
    httpServer.timeout = sseConnectionTimeoutMs;
    
    // Set keep-alive timeout
    httpServer.keepAliveTimeout = sseConnectionTimeoutMs;
    
    // Set headers timeout to match the keep-alive timeout
    httpServer.headersTimeout = sseConnectionTimeoutMs;
    
    logger.info(`HTTP server timeouts configured: timeout=${httpServer.timeout}ms, keepAliveTimeout=${httpServer.keepAliveTimeout}ms, headersTimeout=${httpServer.headersTimeout}ms`);

    httpServer.listen(port, () => {
        logger.info(`MCP Server (Express with SSE & Streamable HTTP) listening on port ${port}`);
    });

    httpServer.on('error', (error) => {
        logger.error('HTTP Server error:', error);
    });

    return httpServer;
}
