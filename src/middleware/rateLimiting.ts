import { AuthConfig, DEFAULT_AUTH_CONFIG } from '../types/auth';

class RateLimiter {
  private static instance: RateLimiter;
  private config: AuthConfig;
  private requests: Map<string, number[]>;

  private constructor() {
    this.config = DEFAULT_AUTH_CONFIG;
    this.requests = new Map();
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public setConfig(config: Partial<AuthConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public isRateLimited(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.rateLimitWindowMs;
    
    // Get existing requests for this key
    let keyRequests = this.requests.get(key) || [];
    
    // Filter out old requests
    keyRequests = keyRequests.filter(timestamp => timestamp > windowStart);
    
    // Check if we're over the limit
    if (keyRequests.length >= this.config.rateLimitRequests) {
      return true;
    }
    
    // Add new request
    keyRequests.push(now);
    this.requests.set(key, keyRequests);
    
    return false;
  }

  public clearRateLimit(key: string): void {
    this.requests.delete(key);
  }
}

export default RateLimiter;