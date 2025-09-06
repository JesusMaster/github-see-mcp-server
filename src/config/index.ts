import dotenv from 'dotenv';
import { logger } from '#core/logger';

// Load environment variables from .env file
dotenv.config();

function findAndLoadToken(): string | undefined {
    let token = process.env.GITHUB_TOKEN;
    if (token) {
        logger.info('GitHub token loaded successfully.');
        return token;
    }

    logger.warn('WARNING: No GitHub token found. API requests may be rate limited or fail.');
    return undefined;
}

export const config = {
    logLevel: process.env.LOG_LEVEL ?? 'info',
    mcpTimeout: process.env.MCP_TIMEOUT ? parseInt(process.env.MCP_TIMEOUT, 10) : 180000,
    ssePort: process.env.MCP_SSE_PORT ? parseInt(process.env.MCP_SSE_PORT, 10) : 3200,
    githubToken: findAndLoadToken() ?? '',
    sseTimeout: process.env.SSE_TIMEOUT ? parseInt(process.env.SSE_TIMEOUT, 10) : 1800000,
    corsAllowOrigin: process.env.CORS_ALLOW_ORIGIN ?? '',
    useMultiplexing: process.env.USE_MULTIPLEXING_SSE === 'true',
    apiKey: process.env.API_KEY ?? '',
    // Rate Limiting Configuration
    rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) : 15 * 60 * 1000, // 15 minutes
    rateLimitMaxRequests: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) : 100, // 100 requests
    rateLimitSseMax: process.env.RATE_LIMIT_SSE_MAX ? parseInt(process.env.RATE_LIMIT_SSE_MAX, 10) : 5, // 5 SSE connections per minute
    rateLimitMessagesMax: process.env.RATE_LIMIT_MESSAGES_MAX ? parseInt(process.env.RATE_LIMIT_MESSAGES_MAX, 10) : 30, // 30 messages per minute
    defaultUserRateLimit: process.env.DEFAULT_USER_RATE_LIMIT ? parseInt(process.env.DEFAULT_USER_RATE_LIMIT, 10) : 1000, // 1000 requests per hour per user
};
