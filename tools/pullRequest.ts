import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from 'zod';
import PullRequest from "#controllers/pullRequest"; // Adjusted path


// Adjusted path

export function registerPullRequestTools(server: McpServer, pullRequestInstance: PullRequest) {


    server.tool(
        'get_pull_request',
        'Get details of a specific pull request',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            pullNumber: z.number().describe('Pull request number (number, required)'),
        },
        async (args) => {
            try {
                let info = await pullRequestInstance.getPullRequest(args.owner, args.repo, args.pullNumber);
                return { content: [{ type: 'text', text: JSON.stringify(info) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'list_pull_requests',
        'List and filter repository pull requests',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            state: z.string().optional().describe('State of the pull request (open, closed, all)'),
            sort: z.string().optional().describe('Sort field (created, updated, popularity, long-running)'),
            direction: z.enum(['asc', 'desc']).optional().describe('Sort direction (asc or desc)'),
            perPage: z.number().optional().describe('Number of results per page'),
            page: z.number().optional().describe('Page number to retrieve'),
        },
        async (args) => {
            try {
                let info = await pullRequestInstance.getListPullRequests(args.owner, args.repo, args.state, args.sort, args.direction, args.perPage, args.page);
                return { content: [{ type: 'text', text: JSON.stringify(info) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'merge_pull_request',
        'Merge a pull request',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            pullNumber: z.number().describe('Pull request number (number, required)'),
            commitMessage: z.string().optional().describe('Commit message (string, optional)'),
            commit_title: z.string().optional().describe('Commit title (string, optional)'),
            merge_method: z.enum(['merge', 'squash', 'rebase']).optional().describe("Merge method ('merge', 'squash', 'rebase') (string, optional)"),
        },
        async (args) => {
            try {
                let info = await pullRequestInstance.mergePullRequest(args.owner, args.repo, args.pullNumber, args.commitMessage, args.commit_title, args.merge_method);
                return { content: [{ type: 'text', text: JSON.stringify(info) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'get_pull_request_files',
        'Get the list of files changed in a pull request',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            pullNumber: z.number().describe('Pull request number (number, required)'),
        },
        async (args) => {
            try {
                let info = await pullRequestInstance.getPullRequestFiles(args.owner, args.repo, args.pullNumber);
                return { content: [{ type: 'text', text: JSON.stringify(info) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'get_pull_request_status',
        'Get the combined status of all status checks for a pull request',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            pullNumber: z.number().describe('Pull request number (number, required)'),
        },
        async (args) => {
            try {
                let info = await pullRequestInstance.getPullRequestStatus(args.owner, args.repo, args.pullNumber);
                return { content: [{ type: 'text', text: JSON.stringify(info) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'update_pull_request_branch',
        'Update a pull request branch with the latest changes from the base branch',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            pullNumber: z.number().describe('Pull request number (number, required)'),
            expectedHeadSha: z.string().optional().describe("The expected SHA of the pull request's HEAD ref (string, optional)"),
        },
        async (args) =>{
            try {
                let info = await pullRequestInstance.updatePullRequestBranch(args.owner, args.repo, args.pullNumber, args.expectedHeadSha);
                return { content: [{ type: 'text', text: JSON.stringify(info) }] };
            }catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'get_pull_request_comments',
        'Get the review comments on a pull request',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            pullNumber: z.number().describe('Pull request number (number, required)'),
        },
        async (args) => {
            try {
                let info = await pullRequestInstance.getPullRequestComments(args.owner, args.repo, args.pullNumber);
                return { content: [{ type: 'text', text: JSON.stringify(info) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'get_pull_request_reviews',
        'Get the reviews on a pull request',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            pullNumber: z.number().describe('Pull request number (number, required)'),
        },
        async (args) => {
            try {
                let info = await pullRequestInstance.getPullRequestReviews(args.owner, args.repo, args.pullNumber);
                return { content: [{ type: 'text', text: JSON.stringify(info) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'create_pull_request_review',
        'Create a review on a pull request review',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            pullNumber: z.number().describe('Pull request number (number, required)'),
            body: z.string().optional().describe('Review body (string, optional)'),
            event: z.enum(['approve', 'request_changes', 'comment']).optional().describe("Review event ('approve', 'request_changes', 'comment') (string, optional)"),
            commitId: z.string().optional().describe('SHA of the commit to review (string, optional)'),
            comments: z.array(z.string()).optional().describe('Array of comment objects (array, optional)'),
        },
        async (args) => {
            try {
                let info = await pullRequestInstance.createPullRequestReview(args.owner, args.repo, args.pullNumber, args.body, args.event, args.commitId, args.comments);
                return { content: [{ type: 'text', text: JSON.stringify(info) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'create_pull_request',
        'Create a new pull request',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            title: z.string().describe('Pull request title (string, required)'),
            head: z.string().describe('The name of the branch where your changes are implemented (string, required)'),
            base: z.string().describe('The name of the branch you want your changes pulled into (string, required)'),
            body: z.string().optional().describe('Pull request body (string, optional)'),
            draft: z.boolean().optional().describe('Indicates if this is a draft pull request (boolean, optional)'),
            maintainer_can_modify: z.boolean().optional().describe('Indicates if the pull request can be modified by the maintainer (boolean, optional)'),
        },
        async (args) => {
            try {
                let info = await pullRequestInstance.createPullRequest(args.owner, args.repo, args.title, args.head, args.base, args.body, args.draft, args.maintainer_can_modify);
                return { content: [{ type: 'text', text: JSON.stringify(info) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'add_pull_request_review_comment',
        'Add a review comment to a pull request or reply to an existing comment',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            pullNumber: z.number().describe('Pull request number (number, required)'),
            body: z.string().describe('Comment body (string, required)'),
            path: z.string().describe('Path to the file (string, required)'),
            commit_id: z.string().optional().describe('SHA of the commit to comment on (string, optional)'),
            in_reply_to: z.number().optional().describe('ID of the comment to reply to (number, optional)'),
            subject_type: z.string().optional().describe('Type of the subject (string, optional)'),
            line: z.number().optional().describe('Line number in the file (number, optional)'),
            side: z.string().optional().describe('Side of the file (string, optional)'),
            start_line: z.number().optional().describe('Starting line number (number, optional)'),
            start_side: z.string().optional().describe('Starting side of the file (string, optional)'),
        },
        async (args) => {
            try {
                let info = await pullRequestInstance.addPullRequestReviewComment(args.owner, args.repo, args.pullNumber, args.body, args.path, args.commit_id, args.in_reply_to, args.subject_type, args.line, args.side, args.start_line, args.start_side);
                return { content: [{ type: 'text', text: JSON.stringify(info) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );

    server.tool(
        'update_pull_request',
        'Update an existing pull request in a GitHub repository',
        {
            owner: z.string().describe('Repository owner (string, required)'),
            repo: z.string().describe('Repository name (string, required)'),
            pullNumber: z.number().describe('Pull request number (number, required)'),
            title: z.string().optional().describe('Pull request title (string, optional)'),
            body: z.string().optional().describe('Pull request body (string, optional)'),
            state: z.enum(['open', 'closed']).optional().describe("State of the pull request ('open', 'closed') (string, optional)"),
            base: z.string().optional().describe('New base branch name (string, optional)'),
            maintainer_can_modify: z.boolean().optional().describe('Indicates if the pull request can be modified by the maintainer (boolean, optional)'),
        },
        async (args) => {
            try {
                let info = await pullRequestInstance.updatePullRequest(args.owner, args.repo, args.pullNumber, args.title, args.body, args.state, args.base, args.maintainer_can_modify);
                return { content: [{ type: 'text', text: JSON.stringify(info) }] };
            } catch (error: any) {
                return { content: [{ type: 'text', text: `Error : ${error.message}` }], isError: true };
            }
        }
    );  


}