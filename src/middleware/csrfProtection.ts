import AuthService from '../services/auth/AuthService';

export const generateCsrfToken = (): string => {
  const authService = AuthService.getInstance();
  const token = authService.generateCsrfToken();
  if (token) {
    sessionStorage.setItem('csrfToken', token);
  }
  return token;
};

export const getCsrfToken = (): string => {
  return sessionStorage.getItem('csrfToken') || '';
};

export const validateCsrfToken = (token: string): boolean => {
  const authService = AuthService.getInstance();
  const storedToken = getCsrfToken();
  return authService.validateCsrfToken(token, storedToken);
};

export const clearCsrfToken = (): void => {
  sessionStorage.removeItem('csrfToken');
};