import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SoundManager } from './CategoryGrid';

interface LoginFormProps {
  redirectPath?: string;
}

const SOUND_EFFECTS = {
  hover: '/sounds/hover-chime.mp3',
  select: '/sounds/select-chime.wav',
  success: '/sounds/success-chime.mp3'
};

export function LoginForm({ redirectPath = "/game" }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAsGuest, error } = useAuth();
  const navigate = useNavigate();
  const soundManagerRef = useRef<SoundManager | null>(null);
  const handleSuccessfulLogin = () => {
    navigate(redirectPath, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      navigate('/game');
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      await loginAsGuest();
      navigate('/guest');
    } catch (err) {
      console.error('Guest login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/reset-password');
  };

  useEffect(() => {
        // Initialize sound manager with all sound effects
        soundManagerRef.current = new SoundManager(SOUND_EFFECTS);
    
        return () => {
          soundManagerRef.current = null;
        };
      }, []);
  
    const playSound = (soundType: keyof typeof SOUND_EFFECTS) => {
        soundManagerRef.current?.play(soundType);
    };

  return (
    <div className="min-h-screen flex items-center justify-center form-container">
      <div className="bg-opacity-80 bg-black container max-w-md w-full p-6 rounded-lg shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-indigo-500/30">
        <h2 className="text-2xl font-bold text-white mb-6 font-orbitron">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-900/50 text-red-200 rounded-lg border border-red-500/50">
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
              autoComplete="username"
              disabled={isLoading}
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
              autoComplete="current-password"
              disabled={isLoading}
              className="mt-1 block w-full rounded-md bg-gray-900/50 border-indigo-500/50 text-white shadow-sm 
                focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50 
                placeholder-gray-400"
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            onMouseEnter={() => playSound('hover')}
            className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white 
              bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 
              transition-all duration-200 ease-in-out transform hover:scale-[1.02] 
              font-tech-mono border border-indigo-400/50 hover:border-indigo-300"
          >
            {isLoading ? (
              <div className="spinner-border animate-spin h-5 w-5 border-t-2 border-white rounded-full"></div>
            ) : (
              'Login'
            )}
          </button>

          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={handleGuestLogin}
              onMouseEnter={() => playSound('hover')}
              disabled={isLoading}
              className="w-1/2 py-2 px-4 border border-gray-500/50 rounded-md shadow-sm 
                text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 
                transition-all duration-200 ease-in-out transform hover:scale-[1.02] 
                font-tech-mono"
            >
              Continue as Guest
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              onMouseEnter={() => playSound('hover')}
              disabled={isLoading}
              className="w-1/2 py-2 px-4 border border-indigo-500/50 rounded-md shadow-sm 
                text-sm font-medium text-indigo-300 hover:bg-indigo-900/50 focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 
                transition-all duration-200 ease-in-out transform hover:scale-[1.02] 
                font-tech-mono"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
