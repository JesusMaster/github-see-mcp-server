# GitHub MCP SSE Server

A Model Context Protocol (MCP) server that provides GitHub API integration through Server-Sent Events (SSE) transport.

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
    GITHUB_TOKEN=your_github_token_here
    API_KEY=your-secret-api-key
    MCP_SSE_PORT=3200
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

### Development Mode

```bash
npm run dev
# or
pnpm run dev
```

### Docker

You can also run the server using Docker.

#### Using Dockerfile

```bash
docker build -t github-see-mcp-server .
docker run -d -p 8080:8080 \
  --name github-see-mcp-server \
  github-see-mcp-server
```

#### Using Docker Compose

Make sure you have a `.env` file created as described in the "Installation" section.

```bash
docker-compose up -d
```

To stop the service, run:

```bash
docker-compose down
```

## Connecting with Claude

To connect to this MCP server with Claude, add the following configuration to your Claude session:

```json
{
    "GITHUB":{
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote@latest",
        "https://{Your domain}/sse",
        "--header",
        "GITHUB_TOKEN:${GITHUB_TOKEN}"
      ],
      "env": {
        "GITHUB_TOKEN": "here your github token"
      }
    }
}
```

## Available GitHub Tools

The server provides tools for managing:

-   Issues
-   Pull Requests
-   Repositories
-   Users

## License

MIT
