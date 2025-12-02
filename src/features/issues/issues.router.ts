import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from 'zod';
import Issues from "#features/issues/issues.service";

export function registerIssueTools(server: McpServer, issuesInstance: Issues) {


    server.registerTool(
        'get_issue',
        {
            description: 'Gets the contents of an issue within a repository',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                issueNumber: z.number().describe('Issue number (number, required)'),
            }
        },
        async (args, req: any) => {
            try {
                let info = await issuesInstance.getIssues(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'get_issue_comments',
        {
            description: 'Get comments for a GitHub issue',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                issueNumber: z.number().describe('Issue number (number, required)'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await issuesInstance.getComments(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'create_issue',
        {
            description: 'Create a new issue in a GitHub repository',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                title: z.string().describe('Issue title (string, required)'),
                body: z.string().optional().describe('Issue body (string, optional)'),
                assignees: z.array(z.string()).optional().describe('Usernames to assign to this issue (string[], optional)'),
                labels: z.array(z.string()).optional().describe('Labels to apply to this issue (string[], optional)'),
                milestone: z.number().optional().describe('ID of the milestone to associate this issue with (number, optional)'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await issuesInstance.createIssue(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'add_issue_comment',
        {
            description: 'Add a comment to an issue',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                issueNumber: z.number().describe('Issue number (number, required)'),
                comment: z.string().describe('Comment text (string, required)'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await issuesInstance.addComment(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'list_issues',
        {
            description: 'List and filter repository issues',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                state: z.enum(['open', 'closed', 'all']).optional().describe("Filter by state ('open', 'closed', 'all') (string, optional)"),
                labels: z.array(z.string()).optional().describe('Labels to filter by (string[], optional)'),
                sort: z.enum(['created', 'updated', 'comments']).optional().describe("Sort by ('created', 'updated', 'comments') (string, optional)"),
                direction: z.enum(['asc', 'desc']).optional().describe("Sort direction ('asc', 'desc') (string, optional)"),
                since: z.string().optional().describe('Filter by date (ISO 8601 timestamp) (string, optional)'),
                page: z.number().optional().describe('Page number (number, optional)'),
                per_page: z.number().optional().describe('Results per page (number, optional)'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await issuesInstance.listIssues(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            }
            catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'update_issue',
        {
            description: 'Update an issue in a GitHub repository',
            inputSchema: {
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
        },
        async (args, req: any) => {
            try {
                let info = await issuesInstance.updateIssue(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'search_issues',
        {
            description: 'Search for issues and pull requests',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                q: z.string().describe('Search query (string, required)'),
                sort: z.enum(['created', 'updated', 'comments']).optional().describe("Sort by ('created', 'updated', 'comments') (string, optional)"),
                order: z.enum(['asc', 'desc']).optional().describe("Sort order ('asc', 'desc') (string, optional)"),
                page: z.number().optional().describe('Page number (number, optional)'),
                per_page: z.number().optional().describe('Results per page (number, optional)'),
                fields: z.array(z.string()).optional().describe('Fields to return (string[], optional)'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await issuesInstance.searchIssues(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );
}
