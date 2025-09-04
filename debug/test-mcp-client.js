// Test script to check if MCP tools are available
import { spawn } from 'child_process';

const mcp = spawn('npx', ['-y', 'mcp-remote@0.1.15', 'http://localhost:3200/sse', '--transport', 'sse-only'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Send initialize request
const initRequest = {
  jsonrpc: '2.0',
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {
      roots: {
        listChanged: true
      },
      sampling: {}
    },
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  },
  id: 1
};

// Send tools/list request after initialization
const toolsListRequest = {
  jsonrpc: '2.0',
  method: 'tools/list',
  params: {},
  id: 2
};

let buffer = '';

mcp.stdout.on('data', (data) => {
  buffer += data.toString();
  
  // Try to parse complete JSON messages
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // Keep incomplete line in buffer
  
  lines.forEach(line => {
    if (line.trim()) {
      try {
        const message = JSON.parse(line);
        console.log('Received:', JSON.stringify(message, null, 2));
        
        // If we get the initialize response, send tools/list
        if (message.id === 1 && message.result) {
          console.log('\nInitialization successful! Requesting tools list...\n');
          mcp.stdin.write(JSON.stringify(toolsListRequest) + '\n');
        }
      } catch (e) {
        // Not a complete JSON message yet
      }
    }
  });
});

mcp.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

mcp.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});

// Send initialize request
setTimeout(() => {
  console.log('Sending initialize request...\n');
  mcp.stdin.write(JSON.stringify(initRequest) + '\n');
}, 1000);

// Exit after 10 seconds
setTimeout(() => {
  mcp.kill();
  process.exit(0);
}, 10000);
