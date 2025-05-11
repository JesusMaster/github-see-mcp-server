import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import http from 'http';
import { URL } from 'url';
import getRawBody from 'raw-body';

const connections = new Map<string, SSEServerTransport>();

export function createSseServer(mcpServer: McpServer, port: number = 8080): http.Server {
    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url || '/', `http://${req.headers.host}`);
        const pathname = url.pathname;

        if (req.method === 'GET' && pathname === '/') {
            console.log('New SSE connection request');

            const transport = new SSEServerTransport('/message', res);

            try {
                await mcpServer.connect(transport);

                connections.set(transport.sessionId, transport);
                console.log(`SSE connection established: ${transport.sessionId}`);

            } catch (error) {
                console.error(`Error connecting MCP Server for SSE: ${error}`);
                if (!res.writableEnded) {
                    res.writeHead(500).end('MCP Server connection error');
                }
                return;
            }

            req.on('close', () => {
                console.log(`SSE connection closed: ${transport.sessionId}`);
                connections.delete(transport.sessionId);
            });

            return;
        }

        if (req.method === 'POST' && pathname === '/message') {
            const sessionId = url.searchParams.get('sessionId');
            if (!sessionId) {
                console.error('POST /message error: Missing sessionId parameter');
                res.writeHead(400).end('Missing sessionId parameter');
                return;
            }

            const transport = connections.get(sessionId);
            if (!transport) {
                console.error(`POST /message error: Session not found for ID ${sessionId}`);
                res.writeHead(404).end('Session not found');
                return;
            }

            let body: string; 
            try {
                body = await getRawBody(req, {
                    limit: '100mb',
                    encoding: 'utf-8',
                });

            } catch (error: any) {
                console.error(`Error reading request body for session ${sessionId}:`, error);

                if (error.type === 'entity.too.large') {
                    res.writeHead(413).end('Payload Too Large');
                } else {
                    res.writeHead(400).end('Bad Request: Could not read body');
                }
                return;
            }

            try {
                await transport.handlePostMessage(req as any, res as any, body);
            } catch (error) {
                console.error(`Error in transport.handlePostMessage for session ${sessionId}:`, error);

                if (!res.writableEnded) {
                    res.writeHead(500).end('Internal server error handling message');
                }
            }

            return;
        }

        console.log(`Unhandled request: ${req.method} ${req.url}`);
        res.writeHead(404).end('Not found');
    });

    server.listen(port, () => {
        console.log(`MCP SSE Server (http) listening on port ${port}`);
    });

    server.on('error', (error) => {
        console.error('HTTP Server error:', error);
    });

    return server;
}
