import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { logger } from '#core/logger';

// Load environment variables from .env file
dotenv.config();

function findAndLoadToken(): string | undefined {
    let token = process.env.GITHUB_TOKEN;
    if (token) {
        logger.info('GitHub token loaded successfully.');
        return token;
    }

    try {
        const possibleTokenPaths = [
            './.github_token',
            path.join(process.env.HOME ?? '', '.github_token'),
            path.join(process.env.HOME ?? '', '.config/github/token')
        ];
        
        for (const tokenPath of possibleTokenPaths) {
            if (fs.existsSync(tokenPath)) {
                token = fs.readFileSync(tokenPath, 'utf8').trim();
                logger.info('GitHub token loaded successfully.');
                return token;
            }
        }
    } catch (error) {
        logger.error('Error reading GitHub token file:', error);
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
    corsAllowOrigin: process.env.CORS_ALLOW_ORIGIN ?? '*',
    useMultiplexing: process.env.USE_MULTIPLEXING_SSE === 'true',
};
