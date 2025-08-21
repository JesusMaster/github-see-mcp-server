import express from "express";
import http from 'http';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
    StreamableHTTPServerTransport, 
    StreamableHTTPServerTransportOptions 
} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { randomUUID } from 'crypto';

const sseTransports: Record<string, SSEServerTransport> = {};

export function createSseServer(mcpServer: McpServer, port: number = 8080): http.Server {
    const app = express();

    app.use(express.json({ limit: '100mb' }));

    // --- Configuración para StreamableHTTPServerTransport ---
    const streamableTransportOptions: StreamableHTTPServerTransportOptions = {
        sessionIdGenerator: () => randomUUID(),
        // Opcional: callback para cuando se inicializa una sesión
        onsessioninitialized: (sessionId) => {
          console.log(`Streamable HTTP session initialized: ${sessionId}`);
        },
    };

    const mcpStreamableTransport = new StreamableHTTPServerTransport(streamableTransportOptions);

    // Conectamos el McpServer al transporte Streamable una vez.
    // Esto permite al McpServer enviar mensajes a través de este transporte.
    mcpServer.connect(mcpStreamableTransport).catch(error => {
        console.error("Failed to connect McpServer to StreamableHTTPServerTransport:", error);
    });

    // Endpoint moderno para Streamable HTTP
    app.all('/mcp', async (req, res) => {
        console.log(`New Streamable HTTP request: ${req.method} ${req.url}`);
        try {
            // req.body es parseado por express.json() si el Content-Type es application/json.
            await mcpStreamableTransport.handleRequest(req, res, req.body);
        } catch (error) {
            console.error(`Error handling Streamable HTTP request for ${req.url}:`, error);
            if (!res.writableEnded) {
                res.status(500).send('Error processing Streamable HTTP request');
            }
        }
    });

    // --- Configuración para SSEServerTransport (legado) ---
    // Endpoint SSE legado para clientes antiguos (establecer conexión)
    app.get('/sse', async (req, res) => {
        console.log('New SSE connection request');

        const transport = new SSEServerTransport('/messages', res); 
        
        try {
            // Para SSE, conectamos el McpServer a cada transporte individual cuando se establece.
            await mcpServer.connect(transport);
            sseTransports[transport.sessionId] = transport;
            console.log(`SSE connection established: ${transport.sessionId}`);
        } catch (error) {
            console.error(`Error connecting MCP Server for SSE: ${error}`);
            if (!res.writableEnded) {
                // Para SSE con http nativo, res.writeHead().end() es común.
                // Con Express, podemos usar res.status().end() o res.status().send().
                res.status(500).send('MCP Server connection error for SSE');
            }
            return; // Importante retornar aquí para no ejecutar código posterior en error.
        }

        req.on('close', () => {
            console.log(`SSE connection closed: ${transport.sessionId}`);
            delete sseTransports[transport.sessionId];
        });
    });

    // Endpoint de mensajes legado para clientes antiguos (enviar mensajes al servidor vía SSE)
    app.post('/messages', async (req, res) => {
        const sessionId = req.query.sessionId as string;

        if (!sessionId) {
            console.error('POST /messages error: Missing sessionId parameter');
            res.status(400).send('Missing sessionId parameter');
            return;
        }

        const transport = sseTransports[sessionId];
        if (!transport) {
            console.error(`POST /messages error: Session not found for ID ${sessionId}`);
            res.status(404).send('Session not found');
            return;
        }
        
        let bodyContent: string;
        if (typeof req.body === 'string') {
            bodyContent = req.body;
        } else if (Buffer.isBuffer(req.body)) {
            bodyContent = req.body.toString('utf-8');
        } else if (typeof req.body === 'object' && req.body !== null) {
            // express.json() ya parseó el cuerpo si era JSON.
            // SSEServerTransport.handlePostMessage espera el cuerpo como string.
            bodyContent = JSON.stringify(req.body);
        } else {
            console.warn(`POST /messages for session ${sessionId}: req.body is not a string, buffer, or parsable object. Type: ${typeof req.body}`);
            bodyContent = ''; 
        }

        try {
            await transport.handlePostMessage(req, res, bodyContent);
        } catch (error) {
            console.error(`Error in transport.handlePostMessage for session ${sessionId}:`, error);
            if (!res.writableEnded) {
                res.status(500).send('Internal server error handling SSE message');
            }
        }
    });
    
    // Middleware para manejar rutas no encontradas (404)
    app.use((req, res) => {
        console.log(`Unhandled request: ${req.method} ${req.url}`);
        res.status(404).send('Not found');
    });

    const httpServer = http.createServer(app);

    httpServer.listen(port, () => {
        console.log(`MCP Server (Express with SSE & Streamable HTTP) listening on port ${port}`);
    });

    httpServer.on('error', (error) => {
        console.error('HTTP Server error:', error);
    });

    return httpServer;
}
