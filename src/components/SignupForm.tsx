import React, { useState, useEffect } from 'react';
import { signUp } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { initializeBackgroundMusic, playBackgroundMusic, stopBackgroundMusic } from '../utils/audioUtils';
import { createUserProfile, getDefaultProfile } from '../services/aws/userService';


export function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [backgroundMusic] = useState(() => initializeBackgroundMusic('/assets/thriller.mp3'));

  useEffect(() => {
    playBackgroundMusic(backgroundMusic);
    return () => {
      stopBackgroundMusic(backgroundMusic);
    };
  }, [backgroundMusic]);

  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('Creating your account...');
    try {
      const { isSignUpComplete, userId, username: createdUsername } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email
          },
          autoSignIn: true
        }
      });
      console.log('Sign up status:', isSignUpComplete);

      // Create user profile
      if (userId) {
        const defaultProfile = getDefaultProfile(userId, createdUsername);
        await createUserProfile(userId, defaultProfile);
      }

      // Always navigate to confirmation page after sign-up
    setError('Account created successfully! Redirecting to confirmation...');
    setTimeout(() => {
      navigate('/confirm-signup', { state: { username } });
    }, 1000);
      // If sign-up is not complete, navigate to confirmation page
      if (!isSignUpComplete) {
        navigate('/confirm-signup', { state: { username } });
      }
    } catch (err) {
      console.error('Signup failed:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/assets/background.gif"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Form Container */}
      <div className="bg-opacity-80 bg-black container max-w-md w-full p-6 rounded-lg shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-indigo-500/30 z-10">
        <h2 className="text-2xl font-bold text-white mb-6 font-orbitron">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className={`p-3 rounded-lg border ${
                error?.includes('successfully') 
                  ? 'bg-green-900/50 text-green-200 border-green-500/50'
                  : 'bg-red-900/50 text-red-200 border-red-500/50'
              }`}>
              {error}
            </div>
          )}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white font-tech-mono">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full rounded-md bg-gray-900/50 border-indigo-500/50 text-white shadow-sm 
                focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50 
                placeholder-gray-400"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white font-tech-mono">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md bg-gray-900/50 border-indigo-500/50 text-white shadow-sm 
                focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50 
                placeholder-gray-400"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white font-tech-mono">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md bg-gray-900/50 border-indigo-500/50 text-white shadow-sm 
                focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50 
                placeholder-gray-400"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white font-tech-mono">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md bg-gray-900/50 border-indigo-500/50 text-white shadow-sm 
                focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50 
                placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white 
              bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 
              transition-all duration-200 ease-in-out transform hover:scale-[1.02] 
              font-tech-mono border border-indigo-400/50 hover:border-indigo-300"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-4 w-full py-2 px-4 border border-gray-500/50 rounded-md shadow-sm 
              text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none 
              focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              transition-all duration-200 ease-in-out transform hover:scale-[1.02] 
              font-tech-mono"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}
