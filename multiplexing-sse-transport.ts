import { Transport, TransportSendOptions } from "@modelcontextprotocol/sdk/shared/transport.js";
import { JSONRPCMessage, RequestId } from "@modelcontextprotocol/sdk/types.js"; // Import RequestId
import { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js"; // Import AuthInfo
import { randomUUID } from 'crypto';
import { Response } from 'express';

export class MultiplexingSSEServerTransport implements Transport {
    public readonly sessionId: string;
    private readonly clients: Map<string, Response> = new Map(); // Map of clientSessionId -> Response
    private readonly requestClientMap: Map<RequestId, string> = new Map(); // Map of requestId -> clientSessionId
    private readonly heartbeatInterval: NodeJS.Timeout | undefined;
    public onmessage?: (message: JSONRPCMessage, extra?: { authInfo?: AuthInfo; }) => void;
    public onclose?: () => void;
    public onerror?: (error: Error) => void;

    constructor() {
        this.sessionId = randomUUID(); // Unique ID for this multiplexing transport
        this.heartbeatInterval = setInterval(() => this.heartbeat(), 20000); // Send heartbeat every 20 seconds
    }

    private heartbeat(): void {
        const heartbeatMessage = `:heartbeat\n\n`;
        this.clients.forEach((res, clientSessionId) => {
            if (!res.writableEnded) {
                try {
                    res.write(heartbeatMessage);
                    if (typeof (res as any).flush === 'function') {
                        (res as any).flush();
                    }
                } catch (error) {
                    this.removeClient(clientSessionId);
                }
            } else {
                this.removeClient(clientSessionId);
            }
        });
    }

    async start(): Promise<void> {

    }

    // Extract message details for logging
    private extractMessageDetails(message: JSONRPCMessage): { 
        messageType: string; 
        methodName?: string; 
        messageId: any
    } {
        let messageType: string = 'unknown';
        let methodName: string | undefined;
        let messageId: any = null;

        if ('method' in message) {
            messageType = 'request/notification';
            methodName = message.method;
            if ('id' in message) {
                messageId = message.id;
            }
        } else if ('result' in message || 'error' in message) {
            messageType = 'response';
            if ('id' in message) {
                messageId = message.id;
            }
        }

        return { messageType, methodName, messageId };
    }

    // Log message information
    private logMessageInfo(
        messageString: string, 
        messageType: string, 
        methodName?: string, 
        messageId: any = null
    ): void {
        if (methodName === 'mcp/toolListChanged') {
            console.log(`MultiplexingSSEServerTransport (${this.sessionId}): Detected mcp/toolListChanged notification.`);
        }
    }

    // Send message to a specific client
    private sendToTargetClient(
        messageString: string, 
        targetClientSessionId: string, 
        relatedRequestId: RequestId
    ): boolean {
        const res = this.clients.get(targetClientSessionId);
        
        if (!res || res.writableEnded) {
            return false;
        }
        
        try {
            res.write(`data: ${messageString}\n\n`);
            if (typeof (res as any).flush === 'function') {
                (res as any).flush();
            }
            return true;
        } catch (error: any) {
            this.removeClient(targetClientSessionId);
            this.onerror?.(new Error(`Failed to send message to client ${targetClientSessionId}: ${error.message}`));
            return false;
        }
    }

    async send(message: JSONRPCMessage, options?: TransportSendOptions): Promise<void> {
        try {
            const messageString = JSON.stringify(message);
            const { messageType, methodName, messageId } = this.extractMessageDetails(message);
            
            this.logMessageInfo(messageString, messageType, methodName, messageId);

            const isTargetedResponse = options?.relatedRequestId && ('result' in message || 'error' in message);
            
            if (!isTargetedResponse) {
                this.broadcastMessage(messageString);
                return;
            }
            
            // Handle targeted response
            const targetClientSessionId = this.requestClientMap.get(options.relatedRequestId as RequestId);
            
            if (!targetClientSessionId) {
                this.broadcastMessage(messageString);
                return;
            }
            
            // We know relatedRequestId exists at this point
            const sentSuccessfully = this.sendToTargetClient(
                messageString, 
                targetClientSessionId, 
                options.relatedRequestId as RequestId
            );
            
            if (!sentSuccessfully) {
                // Fallback to broadcast if targeted send failed
                this.broadcastMessage(messageString);
            } else {
                // Clean up the request mapping after successful delivery
                this.requestClientMap.delete(options.relatedRequestId as RequestId);
            }
        } catch (error: any) {
            this.onerror?.(error);
        }
    }

    private broadcastMessage(messageString: string): void {
        let successfulBroadcasts = 0;
        const clientCount = this.clients.size;
        
        if (clientCount === 0) {
            return;
        }
        
        this.clients.forEach((res, clientSessionId) => {
            if (!res.writableEnded) {
                try {
                    res.write(`data: ${messageString}\n\n`);
                    if (typeof (res as any).flush === 'function') {
                        (res as any).flush();
                    }
                    successfulBroadcasts++;
                } catch (error: any) {
                    this.removeClient(clientSessionId);
                    this.onerror?.(new Error(`Failed to broadcast to client ${clientSessionId}: ${error.message}`));
                }
            } else {
                this.removeClient(clientSessionId);
            }
        });

    }

    async close(): Promise<void> {
        this.clients.forEach((res, clientSessionId) => {
            if (!res.writableEnded) {
                res.end();
            }
        });
        this.clients.clear();
        this.requestClientMap.clear(); // Clear request map on close
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        this.onclose?.();
    }

    // This method is called by the Express POST /messages route
    // It takes a client's sessionId and the message body, then forwards it to the McpServer via onmessage
    async handleClientPostMessage(clientSessionId: string, bodyContent: string): Promise<string | void> {
       
        if (!this.onmessage) {
            return;
        }
        
        try {
            const parsedMessage: JSONRPCMessage = JSON.parse(bodyContent);
            
            // Log message details
            let messageType = 'unknown';
            let methodName: string | undefined;
            let messageId: any = null;
            
            if ('method' in parsedMessage) {
                messageType = 'request/notification';
                methodName = parsedMessage.method;
                if ('id' in parsedMessage) {
                    messageId = parsedMessage.id;
                }
            }
            
            // If it's a request, store the mapping
            if ('id' in parsedMessage && 'method' in parsedMessage) {
                this.requestClientMap.set(parsedMessage.id, clientSessionId);
            }
            
            // Forward the message to the MCP server
            this.onmessage(parsedMessage);
            
            return "Message processed successfully";
        } catch (error: any) {
            const errorMessage = `Error processing client message from ${clientSessionId}: ${error.message}`;
            this.onerror?.(new Error(errorMessage));
            throw error; // Let the caller handle the error response
        }
    }

    // Method to add a new SSE client connection
    addClient(clientSessionId: string, res: Response) {
        this.clients.set(clientSessionId, res);
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });
        // Ensure headers are flushed immediately
        if (typeof res.flushHeaders === 'function') {
            res.flushHeaders();
        }
        // Send the initial endpoint message in the format expected by SSE clients
        res.write(`event: endpoint\n`);
        res.write(`data: /messages?sessionId=${clientSessionId}\n\n`);
        
        // Flush to ensure initial message is sent
        if (typeof (res as any).flush === 'function') {
            (res as any).flush();
        }
    }
    // Method to remove a disconnected SSE client
    removeClient(clientSessionId: string) {
        this.clients.delete(clientSessionId);
    }
}
