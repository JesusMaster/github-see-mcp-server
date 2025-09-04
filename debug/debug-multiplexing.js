// Debug script for testing MCP protocol with multiplexing
import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:3200';

// Test initialize message
async function testInitialize() {
    console.log('Testing MCP initialize protocol...\n');
    
    // First, establish SSE connection
    const sseResponse = await fetch(`${SERVER_URL}/sse`);
    console.log('SSE Connection status:', sseResponse.status);
    
    // Wait a bit for connection to establish
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Send initialize message
    const initMessage = {
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
                name: 'debug-client',
                version: '1.0.0'
            }
        },
        id: 1
    };
    
    console.log('Sending initialize message:', JSON.stringify(initMessage, null, 2));
    
    // Note: This won't work properly without a session ID from the SSE connection
    // This is just to show what message should be sent
    console.log('\nTo properly test, you need to:');
    console.log('1. Connect via SSE and get a session ID');
    console.log('2. Send the initialize message to /messages?sessionId=YOUR_SESSION_ID');
    console.log('3. The server should respond with available tools');
}

// Test tool listing
async function testToolsList() {
    console.log('\n\nTesting tools/list request...\n');
    
    const toolsListMessage = {
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 2
    };
    
    console.log('Tools list message:', JSON.stringify(toolsListMessage, null, 2));
}

// Run tests
testInitialize().then(() => testToolsList()).catch(console.error);
