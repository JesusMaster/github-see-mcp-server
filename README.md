# GitHub MCP SSE Server

A Model Context Protocol (MCP) server that provides GitHub API integration through Server-Sent Events (SSE) transport.

## Features

- **Modular, Feature-Based Architecture**: Code is organized by features (issues, pull requests, etc.) for better maintainability and scalability.
- GitHub API integration through MCP tools
- Support for issues, pull requests, repositories, and more
- Server-Sent Events (SSE) transport for real-time communication
- **Multiplexing SSE transport** for efficient handling of multiple client connections
- Modern Streamable HTTP and legacy SSE transport support
- Automatic port finding if the specified port is in use
- Graceful shutdown handling for clean server termination
- Configurable timeouts, CORS settings, and logging levels
- Robust error handling and detailed logging

## Project Structure

The project follows a modular, feature-based architecture. All source code is located in the `src` directory.

```
/src/
├───config/         # Centralizes application configuration (ports, env vars, etc.)
├───core/           # Shared utilities like the logger and custom error classes.
├───features/       # Contains the core business logic, organized by feature.
│   ├───issues/
│   ├───pullRequests/
│   └───repositories/
├───services/       # Contains a reusable client for the external GitHub API.
├───utils/          # General utility functions (e.g., pagination).
├───server.ts       # Express server setup, middleware, and transport configuration.
└───main.ts         # The main entry point of the application.
```

-   **`features`**: Each subdirectory within `features` represents a module. It contains a `*.service.ts` file for business logic and a `*.router.ts` file for defining MCP tools.
-   **`services`**: Holds reusable clients for external APIs. `github.ts` is a generic client for the GitHub API.
-   **`core`**: Contains the application's core functionalities, such as the configurable `logger`.
-   **`config`**: Manages all environment variables and application configuration.

## Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- GitHub Personal Access Token (for API access)

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/JesusMaster/github-see-mcp-server.git
    cd github-see-mcp-server
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  Create a `.env` file in the root directory with the following content:
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

    # Multiplexing SSE Transport Configuration
    # Set to 'true' to enable multiplexing SSE transport (handles multiple clients with a single transport)
    # Set to 'false' to use individual SSE transport for each client (legacy behavior)
    USE_MULTIPLEXING_SSE=false

    # Rate Limiting Configuration
    RATE_LIMIT_WINDOW_MS=900000 # Time window for rate limiting in milliseconds (e.g., 900000 for 15 minutes)
    RATE_LIMIT_MAX_REQUESTS=100 # Maximum number of requests allowed per window per IP
    RATE_LIMIT_SSE_MAX=5 # Maximum number of SSE connections allowed per minute per IP
    RATE_LIMIT_MESSAGES_MAX=30 # Maximum number of messages allowed per minute per IP
    DEFAULT_USER_RATE_LIMIT=1000 # Default number of requests allowed per hour for a user
    ```

4.  Build the project:
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

You can also run the server using Docker.

#### Using Dockerfile

```bash
docker build -t github-see-mcp-server .
docker run -d -p 3200:3200 -e MCP_TIMEOUT="180000" -e LOG_LEVEL="info" -e CORS_ALLOW_ORIGIN="*" -e GITHUB_TOKEN={YOUR_TOKEN_HERE} -e MCP_SSE_PORT="3200" -e USE_MULTIPLEXING_SSE="true" --name github-see-mcp-server github-see-mcp-server
```

This command:

-   Runs the container in detached mode (`-d`)
-   Maps port 3200 on the host to port 3200 in the container
-   Sets all the environment variables with their default values
-   Names the container "github-see-mcp-server"

#### Using Docker Compose

For a more streamlined approach, you can use Docker Compose. Make sure you have a `.env` file created as described in the "Installation" section.

```bash
docker-compose up -d
```

This command will build the image if it doesn't exist and start the container in the background. The configuration will be loaded from the `.env` file. To stop the service, run:

```bash
docker-compose down
```

## Connecting with Claude

To connect to this MCP server with Claude, add the following configuration to your Claude session:

```json
{
  "mcpServers": {
    "GitHub": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@0.1.15",
        "https://{Your domain}/sse",
        "--transport",
        "sse-only"
      ]
    }
  }
}
```

Replace `{Your domain}` with your actual domain where the server is running.

## API Endpoints

-   `/health` - Health check endpoint that returns server status and version information
-   `/mcp` - Modern MCP Streamable HTTP endpoint for efficient bidirectional communication
-   `/sse` - Server-Sent Events endpoint for legacy clients (establishes SSE connection)
-   `/messages` - Message endpoint for legacy SSE clients (for sending messages to the server)

The server supports both modern and legacy communication methods:

1.  **Modern Streamable HTTP** (`/mcp`): Recommended for new implementations, providing efficient bidirectional communication
2.  **Legacy SSE** (`/sse` and `/messages`): For backward compatibility with older clients
    -   **Individual SSE Transport**: Default mode where each client gets its own transport instance
    -   **Multiplexing SSE Transport**: Optional mode where multiple clients share a single transport instance for better resource efficiency

### Multiplexing SSE Transport

The multiplexing SSE transport is an advanced feature that allows the server to handle multiple client connections through a single transport instance. This provides several benefits:

-   **Resource Efficiency**: Reduces memory usage and connection overhead when handling multiple clients
-   **Simplified Message Broadcasting**: Makes it easier to send messages to all connected clients
-   **Better Connection Management**: Centralized handling of client connections and disconnections
-   **Improved Scalability**: Better performance when dealing with many concurrent connections

To enable multiplexing SSE transport, set `USE_MULTIPLEXING_SSE=true` in your `.env` file.

When multiplexing is enabled:

-   All SSE clients connect through a shared transport instance
-   Each client receives a unique session ID for message routing
-   The server can efficiently broadcast messages to all clients or send targeted messages to specific clients
-   Connection state is managed centrally for all clients

## Available GitHub Tools

The server provides the following GitHub API tools:

### Issues

-   `get_issue` - Get details of a specific issue
-   `get_issue_comments` - Get comments for a GitHub issue
-   `create_issue` - Create a new issue in a GitHub repository
-   `add_issue_comment` - Add a comment to an issue
-   `list_issues` - List and filter repository issues
-   `update_issue` - Update an issue in a GitHub repository
-   `search_issues` - Search for issues and pull requests

### Pull Requests

-   `get_pull_request` - Get details of a specific pull request
-   `list_pull_requests` - List and filter repository pull requests
-   `merge_pull_request` - Merge a pull request
-   `get_pull_request_files` - Get the list of files changed in a pull request
-   `get_pull_request_status` - Get the combined status of all status checks for a pull request
-   `update_pull_request_branch` - Update a pull request branch with the latest changes from the base branch
-   `get_pull_request_comments` - Get the review comments on a pull request
-   `get_pull_request_reviews` - Get the reviews on a pull request
-   `create_pull_request_review` - Create a review on a pull request
-   `create_pull_request` - Create a new pull request
-   `add_pull_request_review_comment` - Add a review comment to a pull request
-   `update_pull_request` - Update an existing pull request

### Repositories

-   `create_file` - Create a single file in a repository
-   `update_file` - Update a single file in a repository
-   `list_branches` - List branches in a GitHub repository
-   `push_files` - Push multiple files in a single commit
-   `search_repositories` - Search for GitHub repositories
-   `create_repository` - Create a new GitHub repository
-   `get_repository_info` - Get information about a GitHub repository
-   `get_user_repositories` - Get information about a GitHub user's repositories
-   `get_file_contents` - Get the contents of a file in a GitHub repository
-   `create_fork` - Create a fork of a GitHub repository
-   `create_branch` - Create a new branch in a GitHub repository
-   `get_branch_info` - Get information about a branch in a GitHub repository
-   `list_commits` - Get a list of commits of a branch in a repository
-   `get_commit` - Get details for a commit from a repository
-   `get_specific_commit` - Get details for a specific commit from a repository

### User

-   `get_me` - Get details of the authenticated user

### Rate Limiting

This server implements a robust rate limiting strategy to ensure fair usage and protect against abuse. The rate limiting is configured in `src/server.ts` and includes several layers of protection:

-   **General Limiter**: A global rate limit is applied to all incoming requests to prevent excessive traffic from a single IP address.
-   **SSE Limiter**: A specific rate limit for Server-Sent Events (SSE) connections to manage real-time communication resources.
-   **Message Limiter**: A rate limit on the number of messages that can be sent to the server to prevent spam and overload.
-   **User-Specific Limiter**: A dynamic rate limit that can be customized for individual users, providing more flexible and granular control.
-   **Critical Operations Limiter**: A stricter rate limit for critical operations such as creating repositories or merging pull requests to prevent accidental or malicious use of sensitive features.

The rate limiting is implemented using the `express-rate-limit` library, which provides a flexible and easy-to-configure solution for Express-based applications. The configuration is managed through environment variables, allowing for easy adjustments without modifying the code.

## Troubleshooting

### Connection Issues

If you're experiencing connection issues:

1.  Check that the GitHub token is valid and has the necessary permissions
2.  Ensure the server is running and accessible
3.  Check the server logs for any error messages
4.  Verify that the client is connecting to the correct endpoint
5.  Check if there are any network issues or firewalls blocking the connection

### Timeout Errors

If you're experiencing timeout errors:

1.  Increase the `MCP_TIMEOUT` value in the `.env` file
2.  Check if the GitHub API is responding slowly
3.  Verify that the client is not sending too many requests

### Logging and Debugging

The server supports different logging levels that can be set in the `.env` file:

-   `debug` - Verbose logging for detailed debugging
-   `info` - Standard logging for general operation information (default)
-   `warn` - Only warnings and errors
-   `error` - Only error messages

To enable more detailed logging for troubleshooting:

```
LOG_LEVEL=debug
```

This will provide more detailed information about requests, responses, and internal operations.

### Multiplexing SSE Transport Issues

If you're experiencing issues with the multiplexing SSE transport:

1.  **Check the configuration**: Ensure `USE_MULTIPLEXING_SSE` is set correctly in the `.env` file
2.  **Enable debug logging**: Set `LOG_LEVEL=debug` to see detailed multiplexing operations
3.  **Monitor client connections**: The logs will show when clients connect/disconnect from the multiplexing transport
4.  **Verify message routing**: Debug logs will show how messages are routed between clients and the server
5.  **Fall back to individual transport**: If issues persist, set `USE_MULTIPLEXING_SSE=false` to use the legacy behavior

## License

MIT
