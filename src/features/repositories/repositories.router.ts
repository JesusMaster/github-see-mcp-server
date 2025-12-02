import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from 'zod';
import Repositories from "#features/repositories/repositories.service";

export function registerRepositoriesTools(server: McpServer, repositoriesInstance: Repositories) {

    server.registerTool(
        'create_file',
        {
            description: 'Create a single file in a repository',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                path: z.string().describe('File path (string, required)'),
                message: z.string().describe('Commit message (string, required)'),
                content: z.string().describe('File content (string, required)'),
                branch: z.string().optional().describe('Branch name (string, optional)'),
                sha: z.string().optional().describe('SHA of the file to update (string, optional)'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await repositoriesInstance.createFileContents(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'update_file',
        {
            description: 'Update a single file in a repository',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                path: z.string().describe('File path (string, required)'),
                message: z.string().describe('Commit message (string, required)'),
                content: z.string().describe('File content (string, required)'),
                branch: z.string().optional().describe('Branch name (string, optional)'),
                sha: z.string().describe('SHA of the file to update (string, required)'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await repositoriesInstance.updateFileContents(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'list_branches',
        {
            description: 'List branches in a GitHub repository',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                page: z.number().optional().describe('Page number (number, optional)'),
                per_page: z.number().optional().describe('Number of items per page (number, optional)'),
                fetchAll: z.boolean().optional().describe('Fetch all pages (boolean, optional)'),
                fields: z.array(z.string()).optional().describe('Fields to return (string[], optional)'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await repositoriesInstance.listBranches(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'push_files',
        {
            description: 'Push multiple files in a single commit',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                branch: z.string().describe('Branch name (string, optional)'),
                commitMessage: z.string().describe('Commit message (string, required)'),
                files: z.array(z.object({ path: z.string(), content: z.string() })).describe('Array of file objects to push'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await repositoriesInstance.pushMultipleFiles(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'search_repositories',
        {
            description: 'Search for GitHub repositories',
            inputSchema: {
                query: z.string().describe('Search query (string, required)'),
                sort: z.string().optional().describe('Sort field (string, optional)'),
                order: z.enum(['asc', 'desc']).optional().describe("Sort order ('asc', 'desc') (string, optional)"),
                page: z.number().optional().describe('Page number (number, optional)'),
                perPage: z.number().optional().describe('Results per page (number, optional)'),
                fetchAll: z.boolean().optional().describe('Fetch all pages (boolean, optional)'),
                fields: z.array(z.string()).optional().describe('Fields to return (string[], optional)'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await repositoriesInstance.searchRepositories(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'create_repository',
        {
            description: 'Create a new GitHub repository',
            inputSchema: {
                name: z.string().describe('Repository name (string, required)'),
                description: z.string().describe('Repository description (string, optional)'),
                private: z.boolean().describe('Whether the repository is private (boolean, optional)'),
                autoInit: z.boolean().describe('Auto-initialize with README (boolean, optional)'),
            }
        }, async (args, req: any) => {
            try {
                let info = await repositoriesInstance.createRepository(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'get_repository_info',
        {
            description: 'Get information about a GitHub repository',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
            }
        }, async (args, req: any) => {
            try {
                // NOTE: The service expects { repoName, userName }, but the tool defines { owner, repo }.
                // Mapping them here.
                let info = await repositoriesInstance.getUserRepoInfo({ userName: args.owner, repoName: args.repo }, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'get_user_repositories',
        {
            description: 'Get information about a GitHub user repositories',
            inputSchema: {
                userName: z.string().describe('GitHub username (string, required)'),
                page: z.number().optional().describe('Page number (number, optional)'),
                perPage: z.number().optional().describe('Results per page (number, optional)'),
                fetchAll: z.boolean().optional().describe('Fetch all pages (boolean, optional)'),
                fields: z.array(z.string()).optional().describe('Fields to return (string[], optional)'),
            }
        }, async (args, req: any) => {
            try {
                let info = await repositoriesInstance.getUserRepos(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'get_file_contents',
        {
            description: 'Get the contents of a file in a GitHub repository',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                path: z.string().describe('Path to the file (string, required)'),
                ref: z.string().optional().describe('Git reference (string, optional)'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await repositoriesInstance.getFileContents(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    )

    server.registerTool(
        'create_fork',
        {
            description: 'Create a fork of a GitHub repository',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                organization: z.string().optional().describe('Organization name (string, optional)'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await repositoriesInstance.createFork(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    )

    server.registerTool(
        'create_branch',
        {
            description: 'Create a new branch in a GitHub repository',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                branch: z.string().describe('Branch name (string, required)'),
                sha: z.string().describe('SHA of the commit to base the new branch on (string, required)'),
            },
        },
        async (args, req: any) => {
            try {
                // NOTE: The service expects { branchName, baseBranch }, but the tool defines { branch, sha }.
                // Mapping them here.
                let info = await repositoriesInstance.createBranch({ owner: args.owner, repo: args.repo, branchName: args.branch, baseBranch: args.sha }, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'get_branch_info',
        {
            description: 'Get information about a branch in a GitHub repository',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                branch: z.string().describe('Branch name (string, required)'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await repositoriesInstance.getBranchInfo(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.registerTool(
        'list_commits',
        {
            description: 'Get a list of commits of a branch in a repository',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                sha: z.string().optional().describe('Branch name, tag, or commit SHA (string, optional)'),
                path: z.string().optional().describe('Only commits containing this file path (string, optional)'),
                page: z.number().optional().describe('Page number (number, optional)'),
                perPage: z.number().optional().describe('Results per page (number, optional)'),
                fetchAll: z.boolean().optional().describe('Fetch all pages (boolean, optional)'),
                fields: z.array(z.string()).optional().describe('Fields to return (string[], optional)'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await repositoriesInstance.listCommits(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    )

    server.registerTool(
        'get_commit',
        {
            description: 'Get details for a commit from a repository',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                sha: z.string().optional().describe('Branch name, tag, or commit SHA (string, optional)'),
                page: z.number().optional().describe('Page number (number, optional)'),
                perPage: z.number().optional().describe('Results per page (number, optional)'),
                fetchAll: z.boolean().optional().describe('Fetch all pages (boolean, optional)'),
                fields: z.array(z.string()).optional().describe('Fields to return (string[], optional)'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await repositoriesInstance.getCommit(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    )

    server.registerTool(
        'get_specific_commit',
        {
            description: 'Get details for an specific commit from a repository',
            inputSchema: {
                owner: z.string().describe('Repository owner (string, required)'),
                repo: z.string().describe('Repository name (string, required)'),
                sha: z.string().describe('Branch name, tag, or commit SHA (string, optional)'),
            },
        },
        async (args, req: any) => {
            try {
                let info = await repositoriesInstance.getSpecificCommit(args, req.requestInfo.headers.github_token);
                return { content: [{ type: 'text', text: JSON.stringify(info, null, 2) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    )
}
