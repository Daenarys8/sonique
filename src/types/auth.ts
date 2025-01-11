export interface PasswordPolicy {
  minLength: number;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  requireUppercase: boolean;
  requireLowercase: boolean;
}

export interface AuthConfig {
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  sessionTimeout: number; // in minutes
  csrfTokenEnabled: boolean;
  rateLimitRequests: number;
  rateLimitWindowMs: number;
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  requireNumbers: true,
  requireSpecialChars: true,
  requireUppercase: true,
  requireLowercase: true
};

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  sessionTimeout: 60,
  csrfTokenEnabled: true,
  rateLimitRequests: 100,
  rateLimitWindowMs: 900000 // 15 minutes
};