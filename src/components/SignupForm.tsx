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
    setError(null);
    setIsLoading(true);
  
    if (!username) {
      setError('Username is required');
      setIsLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      setError(errors.join('\n'));
      setIsLoading(false);
      return;
    }

    // Check rate limiting
    const checkRateLimit = useRateLimit();
    if (!checkRateLimit()) {
      setError('Too many attempts. Please try again later.');
      setIsLoading(false);
      return;
    }
    
    try {
      // Proceed with signup if username is unique
      const { userId } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email
          }
        }
      });
  
      if (!userId) {
        throw new Error('No user ID returned from signup');
      }
  
      // Store both profile data and password temporarily
      const defaultProfile = getDefaultProfile(userId, username);
      sessionStorage.setItem('pendingUserProfile', JSON.stringify(defaultProfile));
      sessionStorage.setItem('tempPassword', password);  // Store password for confirmation step
  
      setError('Account created successfully! Redirecting to confirmation...');
      navigate('/confirm-signup', { state: { username } });

    } catch (err) {
      console.error('Signup failed:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center relative form-container">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/assets/background.gif"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Form Container */}
      <div
        className="bg-opacity-80 bg-black container w-full p-6 rounded-lg shadow-lg fixed"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: 'clamp(18rem, 60%, 24rem)',
          padding: 'clamp(1rem, 2vw, 2rem)',
          border: '1px solid rgba(75, 85, 99, 0.3)',
        }}
      >
        <h2
          className="text-white font-bold mb-6"
          style={{
            fontSize: 'clamp(1.5rem, 2vw, 2.5rem)',
            marginBottom: 'clamp(1rem, 3vw, 2rem)',
          }}
        >
          Create Account
        </h2>
        <form onSubmit={handleSubmit} style={{ gap: 'clamp(0.5rem, 1.5vw, 1rem)' }}>
          {error && (
            <div
              style={{
                padding: 'clamp(0.5rem, 1vw, 0.75rem)',
                borderRadius: '0.5rem',
                backgroundColor: error?.includes('successfully') 
                  ? 'rgba(34, 197, 94, 0.2)' 
                  : 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
              }}
            >
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-white font-tech-mono"
              style={{
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                marginBottom: '0.5rem',
              }}
            >
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
              style={{
                padding: 'clamp(0.5rem, 1vw, 0.75rem)',
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white font-tech-mono"
              style={{
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                marginBottom: '0.5rem',
              }}
            >
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
              style={{
                padding: 'clamp(0.5rem, 1vw, 0.75rem)',
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white font-tech-mono"
              style={{
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                marginBottom: '0.5rem',
              }}
            >
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
              style={{
                padding: 'clamp(0.5rem, 1vw, 0.75rem)',
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-white font-tech-mono"
              style={{
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                marginBottom: '0.5rem',
              }}
            >
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
              style={{
                padding: 'clamp(0.5rem, 1vw, 0.75rem)',
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            style={{
              padding: 'clamp(0.5rem, 1vw, 0.75rem)',
              fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
            }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-4 w-full py-2 px-4 border border-gray-500/50 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            style={{
              padding: 'clamp(0.5rem, 1vw, 0.75rem)',
              fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
            }}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}
