// src/services/aws/authService.ts
import { signIn, signOut, getCurrentUser } from 'aws-amplify/auth';

export const login = async (username: string, password: string) => {
  try {
    const { isSignedIn, nextStep } = await signIn({ 
      username, 
      password 
    });
    console.log('Logged in:', { isSignedIn, nextStep });
    return { isSignedIn, nextStep };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut();
    console.log('Logged out');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getUser = async () => {
  try {
    const userInfo = await getCurrentUser();
    return userInfo;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
