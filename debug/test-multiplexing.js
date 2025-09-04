// Test script for multiplexing SSE transport
import { EventSource } from 'eventsource';
import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:3200';
const NUM_CLIENTS = 3;

// Helper function to create an SSE client
function createSSEClient(clientId) {
    return new Promise((resolve, reject) => {
        const eventSource = new EventSource(`${SERVER_URL}/sse`);
        let sessionId = null;
        
        eventSource.onopen = () => {
            console.log(`Client ${clientId}: SSE connection opened`);
        };
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log(`Client ${clientId}: Received message:`, data);
                
                // Extract session ID from the initial connection message
                if (data.method === 'connection/initialized' && data.params?.sessionId) {
                    sessionId = data.params.sessionId;
                    console.log(`Client ${clientId}: Session ID = ${sessionId}`);
                    resolve({ eventSource, sessionId, clientId });
                }
            } catch (error) {
                console.log(`Client ${clientId}: Received non-JSON message:`, event.data);
            }
        };
        
        eventSource.onerror = (error) => {
            console.error(`Client ${clientId}: SSE error:`, error);
            reject(error);
        };
        
        // Timeout if no session ID received within 5 seconds
        setTimeout(() => {
            if (!sessionId) {
                eventSource.close();
                reject(new Error(`Client ${clientId}: Timeout waiting for session ID`));
            }
        }, 5000);
    });
}

// Helper function to send a message through a client
async function sendMessage(sessionId, message) {
    const response = await fetch(`${SERVER_URL}/messages?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
    });
    
    if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
}

// Main test function
async function testMultiplexingSSE() {
    console.log('Starting multiplexing SSE transport test...\n');
    
    try {
        // Check server health
        const healthResponse = await fetch(`${SERVER_URL}/health`);
        if (!healthResponse.ok) {
            throw new Error('Server health check failed');
        }
        const health = await healthResponse.json();
        console.log('Server health:', health);
        console.log('\n');
        
        // Create multiple SSE clients
        console.log(`Creating ${NUM_CLIENTS} SSE clients...`);
        const clients = await Promise.all(
            Array.from({ length: NUM_CLIENTS }, (_, i) => createSSEClient(i + 1))
        );
        console.log(`\nAll ${NUM_CLIENTS} clients connected successfully!\n`);
        
        // Send a test message from one client
        console.log('Sending test message from Client 1...');
        const testMessage = {
            jsonrpc: '2.0',
            method: 'initialize',
            params: {
                protocolVersion: '2024-11-05',
                capabilities: {},
                clientInfo: {
                    name: 'test-client-1',
                    version: '1.0.0'
                }
            },
            id: 1
        };
        
        const sendResult = await sendMessage(clients[0].sessionId, testMessage);
        console.log('Message sent successfully:', sendResult);
        
        // Wait a bit to see if other clients receive any broadcasts
        console.log('\nWaiting for potential broadcasts...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Close all connections
        console.log('\nClosing all connections...');
        clients.forEach(({ eventSource, clientId }) => {
            eventSource.close();
            console.log(`Client ${clientId}: Connection closed`);
        });
        
        console.log('\nTest completed successfully!');
        
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testMultiplexingSSE().catch(console.error);
