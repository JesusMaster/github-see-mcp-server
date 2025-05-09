# GitHub See MCP Server

A server-side implementation for the GitHub See MCP (Model Context Protocol) project. This server handles the context processing and management between GitHub repositories and model interactions, enabling seamless integration of AI capabilities with your codebase.

## 🚀 Features

- Real-time webhook processing for GitHub events
- AI model communication via Model Context Protocol (MCP)
- Event-driven architecture for handling repository actions
- Custom configuration for repository-to-model mapping
- Secure authentication with GitHub OAuth
- Detailed logging and monitoring capabilities

## 📋 Prerequisites

- Node.js (v16.x or higher)
- MongoDB (v5.0 or higher)
- Valid GitHub OAuth application credentials
- Compatible AI model endpoints

## 🔧 Installation

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/JesusMaster/github-see-mcp-server.git
   cd github-see-mcp-server
   ```

2. Build the Docker image:
   ```bash
   docker build -t github-see-mcp-server .
   ```


## 🔧 Configuration

The server can be configured using:

1. Environment variables
2. Docker environment variables passed at runtime

For Docker deployments, you can pass configuration options directly:

```bash
docker run -d -p 3200:3200 -e GITHUB_TOKEN={YOUR_TOKEN_HERE} -e MCP_SSE_PORT=3200 --name github-see-mcp-server github-see-mcp-server
```


## 📦 Project Structure

```
github-see-mcp-server/
├── controllers/        # Request handlers
│   ├── github.ts
│   └── issues.ts
├── Dockerfile          # Production Docker configuration
├── main.ts             # Application entry point
├── sse-server.ts       # Server-Sent Events handler (if applicable)
├── package.json        # Project dependencies
├── pnpm-lock.yaml      # PNPM lock file
├── README.md           # This file
└── tsconfig.json       # TypeScript configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License.

## 📞 Contact

Project Owner: JesusMaster

GitHub: [@JesusMaster](https://github.com/JesusMaster)

## 🙏 Acknowledgements

- [Model Context Protocol](https://github.com/model-context-protocol/specification)
- [GitHub Webhooks API](https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks)
- [Node.js](https://nodejs.org/)
- All the amazing contributors who have helped shape this project
