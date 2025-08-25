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
const requestTimeoutMs = process.env.MCP_TIMEOUT ? parseInt(process.env.MCP_TIMEOUT, 10) : 180000;
const corsAllowOrigin = process.env.CORS_ALLOW_ORIGIN || '*';

// Configure logging based on environment variable
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
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

const sseTransports: Record<string, SSEServerTransport> = {};

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
    app.use(express.json({ limit: '100mb' }));
    
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
        }, requestTimeoutMs); // Use timeout from environment variable
        
        // For SSE, we connect the McpServer to each individual transport when established
        mcpServer.connect(transport).then(() => {
            clearTimeout(connectionTimeout);
            sseTransports[transport.sessionId] = transport;
            logger.info(`SSE connection established: ${transport.sessionId}`);
            
            // Send an initial heartbeat message in JSON-RPC format
            const initialHeartbeat = {
                jsonrpc: "2.0",
                method: "heartbeat",
                params: {
                    sessionId: transport.sessionId,
                    timestamp: new Date().toISOString()
                }
            };
            res.write(`data: ${JSON.stringify(initialHeartbeat)}\n\n`);
            
            // Set up a heartbeat to keep the connection alive
            const heartbeatInterval = setInterval(() => {
                if (!res.writableEnded) {
                    try {
                        const heartbeat = {
                            jsonrpc: "2.0",
                            method: "heartbeat",
                            params: {
                                timestamp: new Date().toISOString()
                            }
                        };
                        //res.send(`data: ${JSON.stringify(heartbeat)}\n\n`);
                    } catch (err) {
                        clearInterval(heartbeatInterval);
                    }
                } else {
                    clearInterval(heartbeatInterval);
                }
            }, 30000); // Send heartbeat every 30 seconds
            
            req.on('close', () => {
                logger.info(`SSE connection closed: ${transport.sessionId}`);
                delete sseTransports[transport.sessionId];
                clearInterval(heartbeatInterval);
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

        const transport = sseTransports[sessionId];
        if (!transport) {
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
        
        transport.handlePostMessage(req, res, bodyContent)
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

    // Set a longer timeout for the HTTP server to prevent timeouts
    httpServer.timeout = requestTimeoutMs * 2; // Double the request timeout
    
    // Set keep-alive timeout
    httpServer.keepAliveTimeout = requestTimeoutMs; // Match the request timeout
    
    // Set headers timeout to match the keep-alive timeout
    httpServer.headersTimeout = requestTimeoutMs; // Match the request timeout
    
    logger.info(`HTTP server timeouts configured: timeout=${httpServer.timeout}ms, keepAliveTimeout=${httpServer.keepAliveTimeout}ms, headersTimeout=${httpServer.headersTimeout}ms`);

    httpServer.listen(port, () => {
        logger.info(`MCP Server (Express with SSE & Streamable HTTP) listening on port ${port}`);
    });

    httpServer.on('error', (error) => {
        logger.error('HTTP Server error:', error);
    });

    return httpServer;
}
