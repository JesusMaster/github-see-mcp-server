# GitHub See MCP Server

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

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

3. Create a `.env` file based on the provided example:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in the `.env` file:
   ```
   PORT=3000
   MONGODB_URI=mongodb://mongo:27017/github-see-mcp
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   WEBHOOK_SECRET=your_webhook_secret
   MCP_API_KEY=your_mcp_api_key
   MCP_ENDPOINT=https://api.example.com/mcp
   ```

5. Run the container:
   ```bash
   docker run -p 3000:3000 --env-file .env github-see-mcp-server
   ```

### Using Docker Compose

A `docker-compose.yml` file is included for easier deployment with MongoDB:

```bash
docker-compose up -d
```

This will start both the MCP server and a MongoDB instance.

## 🏃‍♂️ Usage

### Running with Docker

```bash
# Start the server
docker start github-see-mcp-server

# View logs
docker logs -f github-see-mcp-server

# Stop the server
docker stop github-see-mcp-server
```

### Running with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Building for Development

If you need to modify the code and test changes:

```bash
# Build with development tag
docker build -t github-see-mcp-server:dev -f Dockerfile.dev .

# Run development version
docker run -p 3000:3000 --env-file .env -v $(pwd)/src:/app/src github-see-mcp-server:dev
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/github` | Receives GitHub webhook events |
| GET | `/api/models` | Lists connected AI models |
| POST | `/api/models/connect` | Registers a new AI model connection |
| GET | `/api/repositories` | Lists registered GitHub repositories |
| POST | `/api/repositories/register` | Registers a new GitHub repository |
| GET | `/api/contexts` | Retrieves available contexts |
| POST | `/api/contexts` | Creates a new context |
| GET | `/api/health` | Server health check |

## 🔧 Configuration

The server can be configured using:

1. Environment variables (see `.env.example`)
2. Configuration files in the `config/` directory
3. Docker environment variables passed at runtime

For Docker deployments, you can pass configuration options directly:

```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e MONGODB_URI=mongodb://mongo:27017/github-see-mcp \
  -e GITHUB_CLIENT_ID=your_github_client_id \
  -e GITHUB_CLIENT_SECRET=your_github_client_secret \
  -e WEBHOOK_SECRET=your_webhook_secret \
  -e MCP_API_KEY=your_mcp_api_key \
  -e MCP_ENDPOINT=https://api.example.com/mcp \
  github-see-mcp-server
```

## 🌐 AI Model Integration

To connect your AI model to this system:

1. Ensure your model supports the Model Context Protocol (MCP)
2. Generate an API key for secure communication
3. Configure the endpoints in your environment variables
4. Register your model through the API

## 📦 Project Structure

```
github-see-mcp-server/
├── src/                # Source code
│   ├── api/            # API routes and controllers
│   ├── config/         # Configuration files
│   ├── db/             # Database models and connection
│   ├── services/       # Business logic services
│   ├── utils/          # Utility functions
│   ├── webhooks/       # GitHub webhook handlers
│   ├── mcp/            # Model Context Protocol handlers
│   └── index.js        # Application entry point
├── tests/              # Test files
├── Dockerfile          # Production Docker configuration
├── Dockerfile.dev      # Development Docker configuration
├── docker-compose.yml  # Docker Compose configuration
├── .env.example        # Example environment variables
└── package.json        # Project dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

Project Owner: JesusMaster

GitHub: [@JesusMaster](https://github.com/JesusMaster)

## 🙏 Acknowledgements

- [Model Context Protocol](https://github.com/model-context-protocol/specification)
- [GitHub Webhooks API](https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks)
- [Node.js](https://nodejs.org/)
- All the amazing contributors who have helped shape this project