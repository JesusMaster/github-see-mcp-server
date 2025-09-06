import { Request, Response, NextFunction } from 'express';
import { config } from '#config/index';
import { logger } from '#core/logger';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        logger.warn('Authentication failed: No Authorization header');
        return res.status(401).json({ error: 'Authorization header required' });
    }

    const tokenParts = authHeader.split(' ');

    if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
        logger.warn('Authentication failed: Invalid token format');
        return res.status(401).json({ error: 'Invalid token format. Expected "Bearer <token>"' });
    }

    const token = tokenParts[1];

    if (token !== config.apiKey) {
        logger.warn('Authentication failed: Invalid API key');
        return res.status(401).json({ error: 'Invalid API key' });
    }

    logger.info('Authentication successful');
    next();
};
