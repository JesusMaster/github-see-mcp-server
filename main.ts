import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createSseServer } from './sse-server.js';

import Issues from "#controllers/issues";
import PullRequest  from "#controllers/pullRequest";
import Repositories from "#controllers/repositories";

import { registerIssueTools } from "#tools/issues";
import { registerPullRequestTools } from "#tools/pullRequest";
import { registerRepositoriesTools } from "#tools/repositories";


import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

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

// Try to get GitHub token from environment variable
let GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// If not found in environment, try to read from a token file
if (!GITHUB_TOKEN) {
    try {
        // Check for token in common locations
        const possibleTokenPaths = [
            './.github_token',
            path.join(process.env.HOME ?? '', '.github_token'),
            path.join(process.env.HOME ?? '', '.config/github/token')
        ];
        
        for (const tokenPath of possibleTokenPaths) {
            if (fs.existsSync(tokenPath)) {
                GITHUB_TOKEN = fs.readFileSync(tokenPath, 'utf8').trim();
                logger.info(`GitHub token loaded from ${tokenPath}`);
                break;
            }
        }
    } catch (error) {
        logger.error('Error reading GitHub token file:', error);
    }
}

// If still no token, use empty string but log a warning
if (!GITHUB_TOKEN) {
    logger.warn('WARNING: No GitHub token found. API requests may be rate limited or fail.');
    GITHUB_TOKEN = "";
} else {
    logger.info('GitHub token successfully loaded');
}

const ISSUES = new Issues(GITHUB_TOKEN);
const PULL_REQUEST = new PullRequest(GITHUB_TOKEN);
const REPOSITORIES = new Repositories(GITHUB_TOKEN);


// Get timeout from environment variable or use default
const mcpTimeout = process.env.MCP_TIMEOUT ? parseInt(process.env.MCP_TIMEOUT, 10) : 180000;

const server = new McpServer({
    name: "mcp-sse-github",
    version: "1.0.0",
    description: "GitHub MCP SSE Server",
    timeoutMs: mcpTimeout, // Use timeout from environment variable
});

logger.info(`MCP Server configured with timeout: ${mcpTimeout}ms`);

// Register tools
registerIssueTools(server, ISSUES);
registerPullRequestTools(server, PULL_REQUEST);
registerRepositoriesTools(server, REPOSITORIES);

// const transport = new StdioServerTransport(); // If you need Stdio transport, uncomment this
// await server.connect(transport); // and this line.

// Configure server port
const findAvailablePort = async (startPort: number, maxAttempts: number = 10): Promise<number> => {
    const net = await import('net');
    
    return new Promise((resolve, reject) => {
        let currentPort = startPort;
        let attempts = 0;
        
        const tryPort = () => {
            attempts++;
            const server = net.createServer();
            
            server.once('error', (err: any) => {
                if (err.code === 'EADDRINUSE') {
                    console.log(`Port ${currentPort} is in use, trying next port...`);
                    currentPort++;
                    if (attempts >= maxAttempts) {
                        reject(new Error(`Could not find an available port after ${maxAttempts} attempts`));
                    } else {
                        tryPort();
                    }
                } else {
                    reject(err);
                }
            });
            
            server.once('listening', () => {
                server.close(() => {
                    resolve(currentPort);
                });
            });
            
            server.listen(currentPort);
        };
        
        tryPort();
    });
};

// Get the port from environment variable or use default
const defaultPort = process.env.MCP_SSE_PORT ? parseInt(process.env.MCP_SSE_PORT, 10) : 3200;
if (isNaN(defaultPort)) {
    console.error(`Invalid MCP_SSE_PORT environment variable: "${process.env.MCP_SSE_PORT}". Must be a number.`);
    process.exit(1); // Exit if port is invalid
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    // Keep the process running, but log the error
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection:', reason);
    // Keep the process running, but log the error
});

// Start the server
(async () => {
    try {
        const ssePort = await findAvailablePort(defaultPort);
        logger.info(`Starting MCP SSE GitHub server on port ${ssePort}...`);
        const httpServer = createSseServer(server, ssePort);
        logger.info(`MCP SSE GitHub server started successfully on port ${ssePort}`);
        
        // Graceful shutdown handlers
        const setupShutdown = (httpServer: any) => {
            // Graceful shutdown
            process.on('SIGINT', async () => {
                logger.info('Received SIGINT signal. Shutting down gracefully...');
                httpServer.close(() => {
                    logger.info('HTTP server closed successfully');
                    process.exit(0);
                });
                
                // Set a timeout to force exit if graceful shutdown takes too long
                setTimeout(() => {
                    logger.error('Forced shutdown after timeout');
                    process.exit(1);
                }, 5000);
            });

            process.on('SIGTERM', async () => {
                logger.info('Received SIGTERM signal. Shutting down gracefully...');
                httpServer.close(() => {
                    logger.info('HTTP server closed successfully');
                    process.exit(0);
                });
                
                // Set a timeout to force exit if graceful shutdown takes too long
                setTimeout(() => {
                    logger.error('Forced shutdown after timeout');
                    process.exit(1);
                }, 5000);
            });
        };
        
        setupShutdown(httpServer);
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
})();

// Note: Shutdown handlers are set up in the async function above
