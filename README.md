# GitHub MCP SSE Server

A Model Context Protocol (MCP) server that provides GitHub API integration through Server-Sent Events (SSE) transport.

## Features

- GitHub API integration through MCP tools
- Support for issues, pull requests, repositories, and more
- Server-Sent Events (SSE) transport for real-time communication
- Multiplexing SSE transport for handling multiple client connections
- Modern Streamable HTTP and legacy SSE transport support
- Automatic port finding if the specified port is in use
- Graceful shutdown handling for clean server termination
- Configurable timeouts, CORS settings, and logging levels
- Robust error handling and detailed logging

## Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- GitHub Personal Access Token (for API access)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/JesusMaster/github-see-mcp-server.git
   cd github-see-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   # GitHub MCP SSE Server Configuration

   # GitHub API Token (required for API access)
   # Generate a token at https://github.com/settings/tokens
   GITHUB_TOKEN=your_github_token_here

   # Server Port Configuration
   MCP_SSE_PORT=3200

   # Timeout Configuration (in milliseconds)
   MCP_TIMEOUT=180000

   # Log Level (debug, info, warn, error)
   LOG_LEVEL=info

   # CORS Configuration
   CORS_ALLOW_ORIGIN=*
   ```

4. Build the project:
   ```bash
   npm run build
   # or
   pnpm run build
   ```

## Usage

### Starting the Server

```bash
npm run start
# or
pnpm run start
```

The server will start on the port specified in the `.env` file (default: 3200). If the port is in use, it will automatically find an available port.

### Development Mode

```bash
npm run dev
# or
pnpm run dev
```

This will build the TypeScript code and start the server.

### Docker

You can also run the server using Docker:

```bash
docker build -t github-see-mcp-server .
docker run -d -p 3200:3200 -e MCP_TIMEOUT="180000" -e LOG_LEVEL="info" -e CORS_ALLOW_ORIGIN="*" -e GITHUB_TOKEN={YOUR_TOKEN_HERE} -e MCP_SSE_PORT="3200" --name github-see-mcp-server github-see-mcp-server
```

This command:
- Runs the container in detached mode (`-d`)
- Maps port 3200 on the host to port 3200 in the container
- Sets all the environment variables with their default values
- Names the container "github-see-mcp-server"

## API Endpoints

- `/health` - Health check endpoint that returns server status and version information
- `/mcp` - Modern MCP Streamable HTTP endpoint for efficient bidirectional communication
- `/sse` - Server-Sent Events endpoint for legacy clients (establishes SSE connection)
- `/messages` - Message endpoint for legacy SSE clients (for sending messages to the server)

The server supports both modern and legacy communication methods:
1. **Modern Streamable HTTP** (`/mcp`): Recommended for new implementations, providing efficient bidirectional communication
2. **Legacy SSE** (`/sse` and `/messages`): For backward compatibility with older clients

## Available GitHub Tools

The server provides the following GitHub API tools:

### Issues
- `get_issue` - Get details of a specific issue
- `get_issue_comments` - Get comments for a GitHub issue
- `create_issue` - Create a new issue in a GitHub repository
- `add_issue_comment` - Add a comment to an issue
- `list_issues` - List and filter repository issues
- `update_issue` - Update an issue in a GitHub repository
- `search_issues` - Search for issues and pull requests

### Pull Requests
- `get_pull_request` - Get details of a specific pull request
- `list_pull_requests` - List and filter repository pull requests
- `merge_pull_request` - Merge a pull request
- `get_pull_request_files` - Get the list of files changed in a pull request
- `get_pull_request_status` - Get the combined status of all status checks for a pull request
- `update_pull_request_branch` - Update a pull request branch with the latest changes from the base branch
- `get_pull_request_comments` - Get the review comments on a pull request
- `get_pull_request_reviews` - Get the reviews on a pull request
- `create_pull_request_review` - Create a review on a pull request
- `create_pull_request` - Create a new pull request
- `add_pull_request_review_comment` - Add a review comment to a pull request
- `update_pull_request` - Update an existing pull request

### Repositories
- `create_file` - Create a single file in a repository
- `update_file` - Update a single file in a repository
- `list_branches` - List branches in a GitHub repository
- `push_files` - Push multiple files in a single commit
- `search_repositories` - Search for GitHub repositories
- `create_repository` - Create a new GitHub repository
- `get_repository_info` - Get information about a GitHub repository
- `get_user_repositories` - Get information about a GitHub user's repositories
- `get_file_contents` - Get the contents of a file in a GitHub repository
- `create_fork` - Create a fork of a GitHub repository
- `create_branch` - Create a new branch in a GitHub repository
- `get_branch_info` - Get information about a branch in a GitHub repository
- `list_commits` - Get a list of commits of a branch in a repository
- `get_commit` - Get details for a commit from a repository
- `get_specific_commit` - Get details for a specific commit from a repository

### User
- `get_me` - Get details of the authenticated user

## Troubleshooting

### Connection Issues

If you're experiencing connection issues:

1. Check that the GitHub token is valid and has the necessary permissions
2. Ensure the server is running and accessible
3. Check the server logs for any error messages
4. Verify that the client is connecting to the correct endpoint
5. Check if there are any network issues or firewalls blocking the connection

### Timeout Errors

If you're experiencing timeout errors:

1. Increase the `MCP_TIMEOUT` value in the `.env` file
2. Check if the GitHub API is responding slowly
3. Verify that the client is not sending too many requests

### Logging and Debugging

The server supports different logging levels that can be set in the `.env` file:

- `debug` - Verbose logging for detailed debugging
- `info` - Standard logging for general operation information (default)
- `warn` - Only warnings and errors
- `error` - Only error messages

To enable more detailed logging for troubleshooting:

```
LOG_LEVEL=debug
```

This will provide more detailed information about requests, responses, and internal operations.

## License

MIT
