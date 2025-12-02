import http from 'http';
import cors from 'cors';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { logger } from '#core/logger';
import express from 'express';

export async function createServer(mcpServer: McpServer, port: number): Promise<http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>> {
    const app = express();
    app.use(cors({
        origin: "*",
        allowedHeaders: ["Content-Type", "Authorization", "Mcp-Session-Id", "Mcp-Protocol-Version", "Accept", "User-Agent", "Authorization", "authorization","GITHUB_TOKEN","github_token"],
        exposedHeaders: ["Mcp-Session-Id", "Mcp-Protocol-Version"],
    }));

    app.use((req, res, next) => {
        // Fix Accept header for MCP SDK strict check
        if (req.headers.accept === "*/*" || !req.headers.accept) {
            req.headers.accept = "application/json, text/event-stream";
        }
        next();
    });

    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
    });

    await mcpServer.connect(transport);

    app.all("/sse", async (req, res) => {
        try {
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            logger.error("Error handling /sse:", error);
        }
    });

    app.all("/messages", async (req, res) => {
        try {
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            logger.error("Error handling /messages:", error);
        }
    });

    const httpServer = http.createServer(app);

    httpServer.listen(port, () => {
        logger.info(`MCP Server (Express with SSE & Streamable HTTP) listening on port ${port}`);
    });

    httpServer.on('error', (error) => {
        logger.error('HTTP Server error:', error);
    });

    return httpServer;
}
