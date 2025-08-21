import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from 'zod';
import { createSseServer } from './sse-server.js';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"; // Commented out as it's unused after refactor

import Issues from "#controllers/issues";
import PullRequest  from "#controllers/pullRequest";
import Repositories from "#controllers/repositories";

import { registerIssueTools } from "#tools/issues";
import { registerPullRequestTools } from "#tools/pullRequest";
import { registerRepositoriesTools } from "#tools/repositories";


import dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const ISSUES = new Issues(GITHUB_TOKEN || "");
const PULL_REQUEST = new PullRequest(GITHUB_TOKEN || "");
const REPOSITORIES = new Repositories(GITHUB_TOKEN || "");


const server = new McpServer({
    name: "mcp-sse-github",
    version: "1.0.0",
    description: "GitHub MCP SSE Server",
});

// Register tools
registerIssueTools(server, ISSUES);
registerPullRequestTools(server, PULL_REQUEST);
registerRepositoriesTools(server, REPOSITORIES);

// const transport = new StdioServerTransport(); // If you need Stdio transport, uncomment this
// await server.connect(transport); // and this line.

const ssePort = process.env.MCP_SSE_PORT ? parseInt(process.env.MCP_SSE_PORT, 10) : 8080; // Default port 8080
if (isNaN(ssePort)) {
    console.error(`Invalid MCP_SSE_PORT environment variable: "${process.env.MCP_SSE_PORT}". Must be a number.`);
}
const httpServer = createSseServer(server, ssePort);


// Graceful shutdown
process.on('SIGINT', async () => {
    httpServer.close(() => {
        process.exit(0);
    });
    process.exit(0);

});

process.on('SIGTERM', async () => {
    httpServer.close(() => {
        process.exit(0);
    });
    process.exit(0);
});
