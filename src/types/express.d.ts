declare namespace Express {
  export interface Request {
    rateLimit?: {
      limit: number;
      current: number;
      remaining: number;
      resetTime?: Date;
    };
    user?: {
      rateLimits?: {
        requestsPerHour?: number;
      };
    };
  }
}
