#!/bin/bash

# Script to run the MCP GitHub server locally with Docker

echo "🚀 MCP GitHub Server - Local Docker Deployment"
echo "============================================="

# Check if .env file exists and has a valid GitHub token
if [ -f .env ]; then
    source .env
    if [ "$GITHUB_TOKEN" = "hp_gQ7caizOXLfy2x9rC4tRS4xq5YgkpE2YK03s" ] || [ -z "$GITHUB_TOKEN" ]; then
        echo "⚠️  WARNING: No valid GitHub token found in .env file"
        echo "Please update GITHUB_TOKEN in .env file with your actual token"
        echo ""
    fi
fi

# Build and run with docker-compose
echo "📦 Building Docker image..."
docker-compose build

echo ""
echo "🏃 Starting the server..."
docker-compose up -d

echo ""
echo "⏳ Waiting for server to be ready..."
sleep 5

# Check if the server is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Server is running!"
    echo ""
    echo "📍 Server endpoints:"
    echo "   - Health check: http://localhost:3200/health"
    echo "   - SSE endpoint: http://localhost:3200/sse"
    echo "   - Messages endpoint: http://localhost:3200/messages"
    echo "   - Modern MCP endpoint: http://localhost:3200/mcp"
    echo ""
    echo "🔧 Configuration:"
    echo "   - Multiplexing SSE: ENABLED"
    echo "   - Port: 3200"
    echo "   - Log level: info"
    echo ""
    echo "📋 Useful commands:"
    echo "   - View logs: docker-compose logs -f"
    echo "   - Stop server: docker-compose down"
    echo "   - Restart server: docker-compose restart"
    echo "   - Run test script: node test-multiplexing.js"
else
    echo "❌ Failed to start the server. Check the logs with:"
    echo "   docker-compose logs"
fi
