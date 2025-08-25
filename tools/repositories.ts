import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from 'zod';
import Repositories from "#controllers/repositories"; // Adjusted path
// Adjusted path

export function registerRepositoriesTools(server: McpServer, repositoriesInstance: Repositories) {



    server.tool(
        'create_file',
        'Create a single file in a repository',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            path: z.string().describe('File path (string, required)'),
            message: z.string().describe('Commit message (string, required)'),
            content: z.string().describe('File content (string, required)'),
            branch: z.string().optional().describe('Branch name (string, optional)'),
            sha: z.string().optional().describe('SHA of the file to update (string, optional)'),
        },
        async (args) => {
            try {
                let info = await repositoriesInstance.CreateFileContents(args.owner, args.repo, args.path, args.message, args.content, args.branch, args.sha);
                return { 
                    content: [
                        { 
                            type: 'text', 
                            text: JSON.stringify(info, null, 2) 
                        }
                    ] 
                };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'update_file',
        'Update a single file in a repository',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            path: z.string().describe('File path (string, required)'),
            message: z.string().describe('Commit message (string, required)'),
            content: z.string().describe('File content (string, required)'),
            branch: z.string().optional().describe('Branch name (string, optional)'),
            sha: z.string().describe('SHA of the file to update (string, required)'),
        },
        async (args) => {
            try {
                let info = await repositoriesInstance.UpdateFileContents(args.owner, args.repo, args.path, args.message, args.content, args.sha, args.branch);
                return { 
                    content: [
                        { 
                            type: 'text', 
                            text: JSON.stringify(info, null, 2) 
                        }
                    ] 
                };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'list_branches',
        'List branches in a GitHub repository',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            page: z.number().optional().describe('Page number (number, optional)'),
            per_page: z.number().optional().describe('Number of items per page (number, optional)'),
        },
        async (args) => {
            try {
                let info = await repositoriesInstance.listBranches(args.owner, args.repo, args.page, args.per_page);
                return { 
                    content: [
                        { 
                            type: 'text', 
                            text: JSON.stringify(info, null, 2) 
                        }
                    ] 
                };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'push_files',
        'Push multiple files in a single commit',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            branch: z.string().describe('Branch name (string, optional)'),
            message: z.string().describe('Commit message (string, required)'),
            files: z.any().describe('Array of comment objects (array, optional)'),
        },
        async(args)=>{
            try {
                let info = await repositoriesInstance.pushMultipleFiles(args.owner, args.repo, args.branch,args.message, args.files);
                return { 
                    content: [
                        { 
                            type: 'text', 
                            text: JSON.stringify(info, null, 2) 
                        }
                    ] 
                };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'search_repositories',
        'Search for GitHub repositories',
        {
            query: z.string().describe('Search query (string, required)'),
            sort: z.string().optional().describe('Sort field (string, optional)'),
            order: z.enum(['asc', 'desc']).optional().describe("Sort order ('asc', 'desc') (string, optional)"),
            page: z.number().optional().describe('Page number (number, optional)'),
            perPage: z.number().optional().describe('Results per page (number, optional)'),
        }, 
        async(args)=>{
            try {
                let info = await repositoriesInstance.searchRepositories(args.query, args.page, args.perPage, args.sort, args.order);
                
                // Format the response as a properly typed content block
                return { 
                    content: [
                        { 
                            type: 'text', 
                            text: JSON.stringify(info, null, 2) 
                        }
                    ] 
                };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'create_repository',
        'Create a new GitHub repository',
        {
            name: z.string().describe('Repository name (string, required)'),
            description: z.string().describe('Repository description (string, optional)'),
            private: z.boolean().describe('Whether the repository is private (boolean, optional)'),
            autoInit: z.boolean().describe('Auto-initialize with README (boolean, optional)'),
        },async(args)=>{

            try {
                let info = await repositoriesInstance.createRepository(args.name,args.description,args.private,args.autoInit);
                return { 
                    content: [
                        { 
                            type: 'text', 
                            text: JSON.stringify(info, null, 2) 
                        }
                    ] 
                };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }

        }
    );

    server.tool(
        'get_repository_info',
        'Get information about a GitHub repository',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
        },async(args)=>{

            try {
                let info = await repositoriesInstance.getUserRepoInfo(args.repo,args.owner);
                return { 
                    content: [
                        { 
                            type: 'text', 
                            text: JSON.stringify(info, null, 2) 
                        }
                    ] 
                };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }

        }
    );
    
    server.tool(
        'get_user_repositories',
        'Get information about a GitHub user repositories',
        {
            userName: z.string().describe('GitHub username (string, required)'),
            page: z.number().optional().describe('Page number (number, optional)'),
            perPage: z.number().optional().describe('Results per page (number, optional)'),
        },async(args)=>{

            try {
                let info = await repositoriesInstance.getUserRepos(args.userName,args.page,args.perPage);
                return { 
                    content: [
                        { 
                            type: 'text', 
                            text: JSON.stringify(info, null, 2) 
                        }
                    ] 
                };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }

        }
    );

    server.tool(
        'get_file_contents',
        'Get the contents of a file in a GitHub repository',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            path: z.string().describe('Path to the file (string, required)'),
            ref: z.string().optional().describe('Git reference (string, optional)'),
        },
        async(args)=>{
            try {
                let info = await repositoriesInstance.getFileContents(args.owner, args.repo, args.path, args.ref);
                return { 
                    content: [
                        { 
                            type: 'text', 
                            text: JSON.stringify(info, null, 2) 
                        }
                    ] 
                };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    )

    server.tool(
        'create_fork',
        'Create a fork of a GitHub repository',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            organization: z.string().optional().describe('Organization name (string, optional)'),
        },
        async(args)=>{
            try {
                let info = await repositoriesInstance.createFork(args.owner, args.repo, args.organization);
                return { 
                    content: [
                        { 
                            type: 'text', 
                            text: JSON.stringify(info, null, 2) 
                        }
                    ] 
                };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    )

    server.tool(
        'create_branch',
        'Create a new branch in a GitHub repository',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            branch: z.string().describe('Branch name (string, required)'),
            sha: z.string().describe('SHA of the commit to base the new branch on (string, required)'),
        },    
         async(args)=>{

            try {
                let info = await repositoriesInstance.createBranch(args.owner, args.repo, args.branch, args.sha);
                return { 
                    content: [
                        { 
                            type: 'text', 
                            text: JSON.stringify(info, null, 2) 
                        }
                    ] 
                };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }

        }
    );

    server.tool(
        'get_branch_info',
        'Get information about a branch in a GitHub repository',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            branch: z.string().describe('Branch name (string, required)'),
        },async(args)=>{

            try {
                let info = await repositoriesInstance.getBranchInfo(args.owner, args.repo, args.branch);
                return { 
                    content: [
                        { 
                            type: 'text', 
                            text: JSON.stringify(info, null, 2) 
                        }
                    ] 
                };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }

        }
    );

    server.tool(
        'list_commits',
        'Get a list of commits of a branch in a repository',
        {

            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            sha: z.string().optional().describe('Branch name, tag, or commit SHA (string, optional)'),
            path: z.string().optional().describe('Only commits containing this file path (string, optional)'),
            page: z.number().optional().describe('Page number (number, optional)'),
            perPage: z.number().optional().describe('Results per page (number, optional)'),

        },
        async(args)=>{
            try {
                let info = await repositoriesInstance.listCommits(args.owner, args.repo, args.sha, args.path, args.page, args.perPage);
                return { 
                    content: [
                        { 
                            type: 'text', 
                            text: JSON.stringify(info, null, 2) 
                        }
                    ] 
                };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }

    )

    server.tool(
        'get_commit',
        'Get details for a commit from a repository',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            sha: z.string().optional().describe('Branch name, tag, or commit SHA (string, optional)'),
            page: z.number().optional().describe('Page number (number, optional)'),
            perPage: z.number().optional().describe('Results per page (number, optional)'),
        },
        async(args)=>{
            try {
                let info = await repositoriesInstance.getCommit(args.owner, args.repo, args.sha,args.page,args.perPage);
                return { 
                    content: [
                        { 
                            type: 'text', 
                            text: JSON.stringify(info, null, 2) 
                        }
                    ] 
                };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    )


    server.tool(
        'get_specific_commit',
        'Get details for an specific commit from a repository',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            sha: z.string().describe('Branch name, tag, or commit SHA (string, optional)'),
        },
        async(args)=>{
            try {
                let info = await repositoriesInstance.getSpecificCommit(args.owner, args.repo, args.sha);
                return { 
                    content: [
                        { 
                            type: 'text', 
                            text: JSON.stringify(info, null, 2) 
                        }
                    ] 
                };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    )

}
