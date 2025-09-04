const { spawn } = require('child_process');

console.log('Testing MultiplexingSSEServerTransport with concurrent clients...\n');

// Function to create an MCP client
function createClient(clientId) {
  return new Promise((resolve, reject) => {
    console.log(`[Client ${clientId}] Starting...`);
    
    const client = spawn('npx', ['-y', 'mcp-remote@0.1.15', 'http://localhost:3200/sse', '--transport', 'sse-only'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let initialized = false;

    client.stdout.on('data', (data) => {
      output += data.toString();
      if (!initialized && output.includes('Proxy established successfully')) {
        initialized = true;
        console.log(`[Client ${clientId}] Connected successfully`);
        
        // Send initialize request
        const initRequest = JSON.stringify({
          jsonrpc: "2.0",
          id: clientId * 100 + 1,
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: {
              name: `test-client-${clientId}`,
              version: "1.0.0"
            }
          }
        }) + '\n';
        
        client.stdin.write(initRequest);
        
        // Send tools/list request after a short delay
        setTimeout(() => {
          const toolsRequest = JSON.stringify({
            jsonrpc: "2.0",
            id: clientId * 100 + 2,
            method: "tools/list",
            params: {}
          }) + '\n';
          
          client.stdin.write(toolsRequest);
          console.log(`[Client ${clientId}] Sent tools/list request`);
          
          // Resolve after sending requests
          setTimeout(() => {
            client.kill();
            resolve(clientId);
          }, 2000);
        }, 1000);
      }
    });

    client.stderr.on('data', (data) => {
      console.error(`[Client ${clientId}] Error:`, data.toString());
    });

    client.on('error', (err) => {
      reject(err);
    });
  });
}

// Create 3 concurrent clients
async function runTest() {
  try {
    const clients = [
      createClient(1),
      createClient(2),
      createClient(3)
    ];
    
    const results = await Promise.all(clients);
    console.log('\nAll clients completed successfully:', results);
    
    // Check server logs
    console.log('\nChecking server logs for multiplexing activity...');
    const { execSync } = require('child_process');
    const logs = execSync('docker logs mcp-github-server --tail 30 | grep -E "(Total clients|MultiplexingSSEServerTransport.*added|MultiplexingSSEServerTransport.*removed)"', { encoding: 'utf8' });
    console.log(logs);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();
