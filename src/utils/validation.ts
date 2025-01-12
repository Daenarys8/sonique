import { PasswordPolicy, DEFAULT_PASSWORD_POLICY } from '../types/auth';

export const validatePassword = (
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`);
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeErrorMessage = (error: any): string => {
  // Define safe error messages
  const safeMessages: { [key: string]: string } = {
    'UserNotConfirmedException': 'Please confirm your account',
    'UserNotFoundException': 'Invalid credentials',
    'NotAuthorizedException': 'Invalid credentials',
    'InvalidPasswordException': 'Password does not meet requirements',
    'UsernameExistsException': 'Username is already taken',
    'CodeMismatchException': 'Invalid verification code',
    'ExpiredCodeException': 'Verification code has expired',
    'LimitExceededException': 'Too many attempts. Please try again later'
  };

  // Get error code from various error formats
  const errorCode = error?.code || error?.name || 'UnknownError';
  
  // Return safe message or generic error
  return safeMessages[errorCode] || 'An unexpected error occurred';
};