import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from 'zod';
import { createSseServer } from './sse-server.js';
//import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Mapa para seguir los intentos por IP
const rateLimitMap = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 10; // Máximo 10 solicitudes por minuto

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  if (rateLimitMap.has(ip)) {
    const record = rateLimitMap.get(ip)!;

    // Reiniciar contador si ha pasado la ventana de tiempo
    if (now - record.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
      return true;
    }

    // Incrementar contador y verificar límite
    record.count++;
    if (record.count > MAX_REQUESTS) {
      return false; // Límite excedido
    }

    return true;
  }

  // Primera solicitud de esta IP
  rateLimitMap.set(ip, { count: 1, timestamp: now });
  return true;
}




const server = new McpServer({
  name: "mcp-apprecio",
  version: "1.0.2",
  description: "Mcp client for Apprecio",
});


server.tool(
  'jwtvalidate',
  'validate a JWT token',
  {
    jwt: z.string().describe("The jwt token to validate"),
  },
  async (args: { jwt: string }, context) => {
    try {
      let _jwt = args.jwt;
      let info = await validateToken(_jwt);

      return { content: [{ type: 'text', text: JSON.stringify(info) }] };
    } catch (error: any) {

      return { content: [{ type: 'text', text: `Error validate jwt: ${error.message}` }], isError: true };
    }
  }
);

server.tool(
  'check_redis_session',
  'check if user sesion is active in Redis',
  {
    jwt: z.string().describe("The jwt token to validate"),
  },
  async (args: { jwt: string }, context) => {
    try {
      let _jwt = args.jwt;

      return { content: [{ type: 'text', text: JSON.stringify({"hello":"world"}) }] };
    } catch (error: any) {

      return { content: [{ type: 'text', text: `Error validate jwt: ${error.message}` }], isError: true };
    }
  }
);



const ssePort = process.env.MCP_SSE_PORT ? parseInt(process.env.MCP_SSE_PORT, 10) : 8080; // Default port 8080
if (isNaN(ssePort)) {
    console.error(`Invalid MCP_SSE_PORT environment variable: "${process.env.MCP_SSE_PORT}". Must be a number.`);
}
const httpServer = createSseServer(server, ssePort);

// Graceful shutdown
process.on('SIGINT', async () => {
  //console.log('SIGINT received, shutting down...');
  httpServer.close(() => {
    //console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  //console.log('SIGTERM received, shutting down...');
  httpServer.close(() => {
    //console.log('HTTP server closed');
    process.exit(0);
  });
});
