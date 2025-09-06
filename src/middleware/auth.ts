import { Request, Response, NextFunction } from 'express';
import { config } from '#config/index';
import { logger } from '#core/logger';


export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        logger.warn('Authentication failed: No Authorization header');
        res.status(401).json({ error: 'Authorization header required' });
        return;
    }

    const tokenParts = authHeader.split(' ');

    if (tokenParts.length !== 2 || tokenParts[0].toLowerCase() !== 'bearer') {
        logger.warn('Authentication failed: Invalid token format');
        res.status(401).json({ error: 'Invalid token format. Expected "Bearer <token>"' });
        return;
    }

    const token = tokenParts[1];

    if (token !== config.apiKey) {
        logger.warn('Authentication failed: Invalid API key');
        res.status(401).json({ error: 'Invalid API key' });
        return;
    }

    logger.info('Authentication successful');
    next();
};
