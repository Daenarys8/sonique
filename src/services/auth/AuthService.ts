import { AuthConfig, DEFAULT_AUTH_CONFIG } from '../../types/auth';
import { Auth } from 'aws-amplify';

class AuthService {
  private static instance: AuthService;
  private authConfig: AuthConfig;
  private loginAttempts: Map<string, number>;
  private lockedAccounts: Map<string, number>;

  private constructor() {
    this.authConfig = DEFAULT_AUTH_CONFIG;
    this.loginAttempts = new Map();
    this.lockedAccounts = new Map();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public setConfig(config: Partial<AuthConfig>): void {
    this.authConfig = { ...this.authConfig, ...config };
  }

  private isAccountLocked(username: string): boolean {
    const lockTime = this.lockedAccounts.get(username);
    if (!lockTime) return false;

    const currentTime = Date.now();
    const lockoutDurationMs = this.authConfig.lockoutDuration * 60 * 1000;

    if (currentTime - lockTime >= lockoutDurationMs) {
      this.lockedAccounts.delete(username);
      this.loginAttempts.delete(username);
      return false;
    }
    return true;
  }

  private incrementLoginAttempts(username: string): void {
    const attempts = (this.loginAttempts.get(username) || 0) + 1;
    this.loginAttempts.set(username, attempts);

    if (attempts >= this.authConfig.maxLoginAttempts) {
      this.lockedAccounts.set(username, Date.now());
    }
  }

  public async login(username: string, password: string): Promise<any> {
    if (this.isAccountLocked(username)) {
      throw new Error('Account is temporarily locked. Please try again later.');
    }

    try {
      const result = await Auth.signIn(username, password);
      this.loginAttempts.delete(username);
      return result;
    } catch (error) {
      this.incrementLoginAttempts(username);
      throw error;
    }
  }

  public generateCsrfToken(): string {
    if (!this.authConfig.csrfTokenEnabled) return '';
    return crypto.randomUUID();
  }

  public validateCsrfToken(token: string, storedToken: string): boolean {
    if (!this.authConfig.csrfTokenEnabled) return true;
    return token === storedToken;
  }
}

export default AuthService;