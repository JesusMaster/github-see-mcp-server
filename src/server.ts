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
import { z } from 'zod';

// Importar configuración y logger centralizados
import { config } from '#config/index';
import { logger } from '#core/logger';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

const generalLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
    message: {
        error: 'Too many requests from this IP',
        retryAfter: `${config.rateLimitWindowMs / 60000} minutes`
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.method} ${req.url}`);
        res.status(429).json({
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((req.rateLimit?.resetTime?.getTime() || Date.now()) / 1000)
        });
    }
});

const sseLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: config.rateLimitSseMax,
    message: 'Too many SSE connections from this IP'
});

const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: config.rateLimitMessagesMax,
    message: 'Too many messages from this IP', // This will be overridden by handler
    handler: (req, res) => {
        logger.warn(`Message Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Too many messages from this IP'
        });
    }
});

const createUserLimiter = () => rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: (req: Request) => {
        // @ts-ignore
        return req.user?.rateLimits?.requestsPerHour || config.defaultUserRateLimit;
    },
    message: 'User rate limit exceeded'
});

const CRITICAL_TOOLS = [
    'create_repository',
    'merge_pull_request',
    'push_files',
    'create_fork'
];

const isCriticalOperation = (toolName: string): boolean => {
    return CRITICAL_TOOLS.includes(toolName);
};

const criticalOperationsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // Solo 10 operaciones críticas por hora
    message: 'Critical operation rate limit exceeded', // This will be overridden by handler
    handler: (req, res) => {
        logger.warn(`Critical operation rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Critical operation rate limit exceeded'
        });
    }
});

const rateLimitMonitor = (req: Request, res: Response, next: NextFunction) => {
    const remaining = req.rateLimit?.remaining || 0;
    const total = req.rateLimit?.limit || 0;

    if (remaining > 0 && remaining < total * 0.1) {
        logger.warn(`Rate limit warning for ${req.ip} on ${req.method} ${req.url}: ${remaining}/${total} remaining`);
    }

    if (remaining === 0) {
        logger.error(`Rate limit exceeded for ${req.ip} on ${req.method} ${req.url}`);
    }

    next();
};

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

    app.use(express.json({
    limit: '1mb', // Reducir de 300mb actual
    verify: (req, res, buf) => {
        if (buf.length > 1048576) { // 1MB
            throw new Error('Payload too large');
        }
    }
}));

    // Aplicar rate limiting general a todas las rutas
    app.use(generalLimiter);
    app.use(rateLimitMonitor); // Aplicar el monitor después del limiter
    
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

    app.all('/mcp', createUserLimiter(), (req: express.Request, res: express.Response, next: express.NextFunction) => {
        logger.debug(`New Streamable HTTP request: ${req.method} ${req.url}`);
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        // Check for critical operations
        const toolName = req.body?.toolName; // Assuming toolName is in the request body
        if (toolName && isCriticalOperation(toolName)) {
            criticalOperationsLimiter(req, res, () => {
                // Continue with the original /mcp logic after criticalOperationsLimiter
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
        } else {
            // Original /mcp logic if not a critical operation
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
        }
    });

    app.get('/sse', sseLimiter, (req: express.Request, res: express.Response) => {
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
                logger.warn(`Multiplexed SSE connection closed for session: ${clientSessionId}.`);
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

    app.post('/messages', messageLimiter, (req: express.Request, res: express.Response) => {
        try {
            const sessionIdSchema = z.string().uuid();
            const sessionId = sessionIdSchema.parse(req.query.sessionId);

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
        } catch (error:any) {
            logger.error('Invalid sessionId format');
            res.status(400).json({ error: `Invalid session ID format, ${error.message}` });
        }
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
