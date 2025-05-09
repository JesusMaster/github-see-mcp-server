import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from 'zod';
import { createSseServer } from './sse-server.js';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import Issues from "./controllers/issues.js";

import dotenv from 'dotenv';
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const ISSUES = new Issues(GITHUB_TOKEN || "");



const server = new McpServer({
    name: "mcp-sse-github",
    version: "1.0.0",
    description: "GitHub MCP SSE Server",
});


server.tool(
    'get_me',
    'Get details of the authenticated user',
    {},
    async () => {
        try {
            let info = await ISSUES.getUserInfo();
            return { content: [{ type: 'text', text: JSON.stringify(info) }] };
        } catch (error: any) {

            return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true };
        }
    }
);

server.tool(
    'get_issue',
    'Gets the contents of an issue within a repository',
    {
        owner: z.string().describe('Repository owner (string, required)'),
        repo: z.string().describe('Repository name (string, required)'),
        issueNumber: z.number().describe('Issue number (number, required)'),
    },
    async (args) => {
        try {
            let info = await ISSUES.getIssues(args.owner, args.repo, args.issueNumber);
            return { content: [{ type: 'text', text: JSON.stringify(info) }] };
        } catch (error: any) {
            return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
        }
    }
);

server.tool(
    'get_issue_comments',
    'Get comments for a GitHub issue',
    {
        owner: z.string().describe('Repository owner (string, required)'),
        repo: z.string().describe('Repository name (string, required)'),
        issueNumber: z.number().describe('Issue number (number, required)'),
    },
    async (args) => {
        try {
            let info = await ISSUES.getComments(args.owner, args.repo, args.issueNumber);
            return { content: [{ type: 'text', text: JSON.stringify(info) }] };
        } catch (error: any) {
            return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
        }
    }
);

server.tool(
    'create_issue',
    'Create a new issue in a GitHub repository',
    {
        owner: z.string().describe('Repository owner (string, required)'), //required
        repo: z.string().describe('Repository name (string, required)'),
        title: z.string().describe('Issue title (string, required)'),
        body: z.string().optional().describe('Issue body (string, optional)'),
        assignees: z.array(z.string()).optional().describe('Usernames to assign to this issue (string[], optional)'),
        labels: z.array(z.string()).optional().describe('Labels to apply to this issue (string[], optional)'),
        milestone: z.number().optional().describe('ID of the milestone to associate this issue with (number, optional)'),
    },
    async (args) => {
        try {
            let info = await ISSUES.createIssue(args.owner, args.repo, args.title, args.body, args.assignees, args.labels, args.milestone);
            return { content: [{ type: 'text', text: JSON.stringify(info) }] };
        } catch (error: any) {
            return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
        }
    }
);

server.tool(
    'add_issue_comment',
    'Add a comment to an issue',
    {
        owner: z.string().describe('Repository owner (string, required)'),
        repo: z.string().describe('Repository name (string, required)'),
        issueNumber: z.number().describe('Issue number (number, required)'),
        comment: z.string().describe('Comment text (string, required)'),
    },
    async (args) => {
        try {
            let info = await ISSUES.addComment(args.owner, args.repo, args.issueNumber, args.comment);
            return { content: [{ type: 'text', text: JSON.stringify(info) }] };
        } catch (error: any) {
            return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
        }
    }
);

server.tool(
    'list_issues',
    'List and filter repository issues',
    {
        owner: z.string().describe('Repository owner (string, required)'),
        repo: z.string().describe('Repository name (string, required)'),
        state: z.enum(['open', 'closed','all']).optional().describe("Filter by state ('open', 'closed', 'all') (string, optional)"),
        labels: z.array(z.string()).optional().describe('Labels to filter by (string[], optional)'),
        sort: z.enum(['created', 'updated', 'comments']).optional().describe("Sort by ('created', 'updated', 'comments') (string, optional)"),
        direction: z.enum(['asc', 'desc']).optional().describe("Sort direction ('asc', 'desc') (string, optional)"),
        since: z.string().optional().describe('Filter by date (ISO 8601 timestamp) (string, optional)'),
        page: z.number().optional().describe('Page number (number, optional)'),
        per_page: z.number().optional().describe('Results per page (number, optional)'),
    },
    async (args) => {
        try {
            let info = await ISSUES.listIssues(args.owner, args.repo, args.state, args.labels, args.sort, args.direction, args.since, args.page, args.per_page);
            return { content: [{ type: 'text', text: JSON.stringify(info) }] };
        }
        catch (error: any) {
            return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
        }
    }
);

server.tool(
    'update_issue',
    'Update an issue in a GitHub repository',
    {
        owner: z.string().describe('Repository owner (string, required)'),
        repo: z.string().describe('Repository name (string, required)'),
        issueNumber: z.number().describe('Issue number (number, required)'),
        title: z.string().optional().describe('New issue title (string, optional)'),
        body: z.string().optional().describe('New issue body (string, optional)'),
        assignees: z.array(z.string()).optional().describe('Usernames to assign to this issue (string[], optional)'),
        state: z.enum(['open', 'closed']).optional().describe("New issue state ('open', 'closed') (string, optional)"),
        milestone: z.number().optional().describe('New milestone ID (number, optional)'),
        labels: z.array(z.string()).optional().describe('New labels (string[], optional)'),
    },
    async (args) => {
        try {
            let info = await ISSUES.updateIssue(args.owner, args.repo, args.issueNumber, args.title, args.body,args.assignees, args.milestone,args.state, args.labels);
            return { content: [{ type: 'text', text: JSON.stringify(info) }] };
        } catch (error: any) {
            return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
        }
    }
);

server.tool(
    'search_issues',
    'Search for issues and pull requests',
    {
        owner: z.string().describe('Repository owner (string, required)'),
        repo: z.string().describe('Repository name (string, required)'),
        q: z.string().describe('Search query (string, required)'),
        sort: z.enum(['created', 'updated', 'comments']).optional().describe("Sort by ('created', 'updated', 'comments') (string, optional)"),
        order: z.enum(['asc', 'desc']).optional().describe("Sort order ('asc', 'desc') (string, optional)"),
        page: z.number().optional().describe('Page number (number, optional)'),
        per_page: z.number().optional().describe('Results per page (number, optional)'),
    },
    async (args) => {
        try {
            let info = await ISSUES.searchIssues(args.owner, args.repo,args.q, args.sort, args.order, args.page, args.per_page);
            return { content: [{ type: 'text', text: JSON.stringify(info) }] };
        } catch (error: any) {
            return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
        }
    }
);



const transport = new StdioServerTransport();
await server.connect(transport);


// const ssePort = process.env.MCP_SSE_PORT ? parseInt(process.env.MCP_SSE_PORT, 10) : 8080; // Default port 8080
// if (isNaN(ssePort)) {
//     console.error(`Invalid MCP_SSE_PORT environment variable: "${process.env.MCP_SSE_PORT}". Must be a number.`);
// }
// const httpServer = createSseServer(server, ssePort);

// Graceful shutdown
process.on('SIGINT', async () => {
    //   httpServer.close(() => {
    //     process.exit(0);
    //   });
    process.exit(0);

});

process.on('SIGTERM', async () => {
    //   httpServer.close(() => {
    //     process.exit(0);
    //   });

    process.exit(0);
});
