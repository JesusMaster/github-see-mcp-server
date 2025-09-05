import express from "express";
import http from 'http';
import cors from 'cors';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
    StreamableHTTPServerTransport, 
    StreamableHTTPServerTransportOptions 
} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { MultiplexingSSEServerTransport } from "./multiplexing-sse-transport.js";
import { randomUUID } from 'crypto';

// Importar configuración y logger centralizados
import { config } from '#config/index';
import { logger } from '#core/logger';

const sseTransports: Record<string, { transport: SSEServerTransport, res: express.Response }> = {};
let multiplexingTransport: MultiplexingSSEServerTransport | null = null;

export function closeAllSseConnections() {
    if (config.useMultiplexing && multiplexingTransport) {
        logger.info('Closing multiplexing SSE transport...');
        multiplexingTransport.close().catch(error => {
            logger.error('Error closing multiplexing transport:', error);
        });
    } else {
        logger.info(`Closing all active SSE connections (${Object.keys(sseTransports).length})...`);
        for (const sessionId in sseTransports) {
            const { res } = sseTransports[sessionId];
            try {
                if (!res.writableEnded) {
                    res.write('event: server-shutdown\n');
                    res.write('data: {"message": "Server is shutting down. Please reconnect."}\n\n');
                    res.end();
                    logger.info(`Closed SSE connection for session: ${sessionId}`);
                }
            } catch (error) {
                logger.error(`Error closing SSE connection for session ${sessionId}:`, error);
            }
        }
    }
}

export function createServer(mcpServer: McpServer, port: number): http.Server {
    const app = express();

    app.use(cors({
        origin: config.corsAllowOrigin,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }));
    logger.info(`CORS configured with origin: ${config.corsAllowOrigin}`);

    app.use(express.json({ limit: '300mb' }));
    
    app.get('/health', (req: express.Request, res: express.Response) => {
        res.status(200).json({
            status: 'ok', 
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            serverName: 'mcp-sse-github'
        });
    });

    const streamableTransportOptions: StreamableHTTPServerTransportOptions = {
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          logger.info(`Streamable HTTP session initialized: ${sessionId}`);
        },
    };

    const mcpStreamableTransport = new StreamableHTTPServerTransport(streamableTransportOptions);
    mcpServer.connect(mcpStreamableTransport).catch(error => {
        logger.error("Failed to connect McpServer to StreamableHTTPServerTransport:", error);
    });

    if (config.useMultiplexing) {
        logger.info('Initializing MultiplexingSSEServerTransport...');
        multiplexingTransport = new MultiplexingSSEServerTransport();
        mcpServer.connect(multiplexingTransport).then(() => {
            logger.info('MultiplexingSSEServerTransport connected to McpServer');
        }).catch(error => {
            logger.error('Failed to connect McpServer to MultiplexingSSEServerTransport:', error);
            multiplexingTransport = null;
        });
    }

    app.all('/mcp', (req: express.Request, res: express.Response) => {
        logger.debug(`New Streamable HTTP request: ${req.method} ${req.url}`);
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }
        
        const requestTimeout = setTimeout(() => {
            if (!res.writableEnded) {
                logger.error(`Request timeout for ${req.url}`);
                res.status(408).json({
                    error: 'Request timeout',
                    message: 'The request took too long to process'
                });
            }
        }, config.mcpTimeout);
        
        mcpStreamableTransport.handleRequest(req, res, req.body)
            .then(() => clearTimeout(requestTimeout))
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

    app.get('/sse', (req: express.Request, res: express.Response) => {
        logger.info('New SSE connection request');
        if (config.useMultiplexing && multiplexingTransport) {
            const clientSessionId = randomUUID();
            logger.info(`Using MultiplexingSSEServerTransport for client: ${clientSessionId}`);
            multiplexingTransport.addClient(clientSessionId, res);
            
            const heartbeatInterval = setInterval(() => {
                if (res.writableEnded) {
                    clearInterval(heartbeatInterval);
                    return;
                }
                logger.debug(`Sending heartbeat to multiplexed session ${clientSessionId}`);
                res.write(': heartbeat\n\n');
            }, 10000);
            
            req.on('close', () => {
                clearInterval(heartbeatInterval);
                logger.warn(`Multiplexed SSE connection closed for session: ${clientSessionId}. Request aborted: ${req.aborted}`);
                if (multiplexingTransport) {
                    multiplexingTransport.removeClient(clientSessionId);
                }
            });
        } else {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no');

            const transport = new SSEServerTransport('/messages', res); 
            
            const connectionTimeout = setTimeout(() => {
                if (!res.writableEnded) {
                    logger.error('SSE connection timeout');
                    res.status(408).send('Connection timeout');
                }
            }, config.sseTimeout);
            
            mcpServer.connect(transport).then(() => {
                clearTimeout(connectionTimeout);
                sseTransports[transport.sessionId] = { transport, res };
                logger.info(`SSE connection established: ${transport.sessionId}`);

                const heartbeatInterval = setInterval(() => {
                    if (res.writableEnded) {
                        clearInterval(heartbeatInterval);
                        return;
                    }
                    logger.debug(`Sending heartbeat to session ${transport.sessionId}`);
                    res.write(': heartbeat\n\n');
                }, 10000);
                            
                req.on('close', () => {
                    clearInterval(heartbeatInterval);
                    logger.warn(`SSE connection closed for session: ${transport.sessionId}.`);
                    delete sseTransports[transport.sessionId];
                });
            }).catch((error) => {
                clearTimeout(connectionTimeout);
                logger.error(`Error connecting MCP Server for SSE: ${error}`);
                if (!res.writableEnded) {
                    res.status(500).send('MCP Server connection error for SSE');
                }
            });
        }
    });

    app.post('/messages', (req: express.Request, res: express.Response) => {
        const sessionId = req.query.sessionId as string;
        if (!sessionId) {
            logger.error('POST /messages error: Missing sessionId parameter');
            res.status(400).json({ error: 'Missing sessionId parameter' });
            return;
        }

        const bodyContent = (typeof req.body === 'object' && req.body !== null) 
            ? JSON.stringify(req.body) 
            : (req.body?.toString() ?? '');

        const messageTimeout = setTimeout(() => {
            if (!res.writableEnded) {
                logger.error(`Message processing timeout for session ${sessionId}`);
                res.status(408).json({ error: 'Request timeout' });
            }
        }, config.mcpTimeout);

        const transport = (config.useMultiplexing && multiplexingTransport) 
            ? multiplexingTransport 
            : sseTransports[sessionId]?.transport;

        if (!transport) {
            logger.error(`POST /messages error: Session not found for ID ${sessionId}`);
            res.status(404).json({ error: 'Session not found' });
            clearTimeout(messageTimeout);
            return;
        }

        const handlePromise = config.useMultiplexing && multiplexingTransport
            ? multiplexingTransport.handleClientPostMessage(sessionId, bodyContent)
            : (transport as SSEServerTransport).handlePostMessage(req, res, bodyContent);

        handlePromise
            .then(() => clearTimeout(messageTimeout))
            .catch((error) => {
                clearTimeout(messageTimeout);
                logger.error(`Error handling message for session ${sessionId}:`, error);
                if (!res.writableEnded) {
                    res.status(500).json({ error: 'Internal server error' });
                }
            });
    });
    
    app.use((req: express.Request, res: express.Response) => {
        logger.debug(`Unhandled request: ${req.method} ${req.url}`);
        res.status(404).json({ error: 'Not found' });
    });

    const httpServer = http.createServer(app);
    httpServer.timeout = config.sseTimeout;
    httpServer.keepAliveTimeout = config.sseTimeout;
    httpServer.headersTimeout = config.sseTimeout;
    
    logger.info(`HTTP server timeouts configured: timeout=${httpServer.timeout}ms, keepAliveTimeout=${httpServer.keepAliveTimeout}ms`);

    httpServer.listen(port, () => {
        logger.info(`MCP Server (Express with SSE & Streamable HTTP) listening on port ${port}`);
    });

    httpServer.on('error', (error) => {
        logger.error('HTTP Server error:', error);
    });

    return httpServer;
}