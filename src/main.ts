import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createHttpTerminator } from 'http-terminator';
import net from 'net';

import { config } from '#config/index';
import { logger } from '#core/logger';

// Importa los nuevos módulos de servidor y servicios
import { createServer, closeAllSseConnections } from './server.js';
import Issues from "#features/issues/issues.service";
import PullRequest from "#features/pullRequests/pullRequest.service";
import Repositories from "#features/repositories/repositories.service";

// Importa los registros de herramientas
import { registerIssueTools } from "#features/issues/issues.router";
import { registerPullRequestTools } from "#features/pullRequests/pullRequest.router";
import { registerRepositoriesTools } from "#features/repositories/repositories.router";

// --- 1. Instancia del Servidor MCP ---
const mcpServer = new McpServer({
    name: "mcp-sse-github",
    version: "1.0.0",
    description: "GitHub MCP SSE Server",
    timeoutMs: config.mcpTimeout,
});
logger.info(`MCP Server configured with timeout: ${config.mcpTimeout}ms`);

// --- 2. Instancia de Servicios ---
const issuesService = new Issues(config.githubToken);
const pullRequestService = new PullRequest(config.githubToken);
const repositoriesService = new Repositories(config.githubToken);

// --- 3. Registro de Herramientas ---
registerIssueTools(mcpServer, issuesService);
registerPullRequestTools(mcpServer, pullRequestService);
registerRepositoriesTools(mcpServer, repositoriesService);

// --- 4. Lógica de Búsqueda de Puerto ---
const isPortAvailable = async (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(false));
        server.once('listening', () => server.close(() => resolve(true)));
        server.listen(port);
    });
};

const findAvailablePort = async (startPort: number, maxAttempts: number = 10): Promise<number> => {
    for (let i = 0; i < maxAttempts; i++) {
        const port = startPort + i;
        if (await isPortAvailable(port)) {
            return port;
        }
        logger.info(`Port ${port} is in use, trying next port...`);
    }
    throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
};

// --- 5. Manejadores de Errores Globales ---
process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection:', reason);
});

// --- 6. Función de Inicio del Servidor ---
const startServer = async () => {
    try {
        const port = await findAvailablePort(config.ssePort);
        logger.info(`Starting MCP SSE GitHub server on port ${port}...`);
        
        const httpServer = createServer(mcpServer, port);
        const httpTerminator = createHttpTerminator({ server: httpServer });

        logger.info(`MCP SSE GitHub server started successfully on port ${port}`);

        const shutdown = async (signal: string) => {
            logger.info(`Received ${signal} signal. Starting graceful shutdown...`);
            closeAllSseConnections();
            await new Promise(resolve => setTimeout(resolve, 500));
            try {
                await httpTerminator.terminate();
                logger.info('HTTP server terminated successfully. Exiting.');
                process.exit(0);
            } catch (error) {
                logger.error('Error during HTTP server termination:', error);
                process.exit(1);
            }
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();