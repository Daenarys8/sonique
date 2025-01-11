import { useRef, useCallback } from 'react';
import { AuthConfig, DEFAULT_AUTH_CONFIG } from '../types/auth';

interface RateLimitState {
  lastRequest: number;
  requestCount: number;
}

export function useRateLimit(config: Partial<AuthConfig> = {}) {
  const { 
    rateLimitRequests, 
    rateLimitWindowMs 
  } = { ...DEFAULT_AUTH_CONFIG, ...config };

  const state = useRef<RateLimitState>({
    lastRequest: 0,
    requestCount: 0
  });

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const windowStart = now - rateLimitWindowMs;

    if (state.current.lastRequest < windowStart) {
      // Reset if outside window
      state.current = {
        lastRequest: now,
        requestCount: 1
      };
      return true;
    }

    if (state.current.requestCount >= rateLimitRequests) {
      return false;
    }

    state.current = {
      lastRequest: now,
      requestCount: state.current.requestCount + 1
    };
    return true;
  }, [rateLimitRequests, rateLimitWindowMs]);

  return checkRateLimit;
}