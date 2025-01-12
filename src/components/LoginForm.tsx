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
      <div
        className="bg-opacity-80 bg-black container max-w-md w-full p-6 rounded-lg shadow-lg fixed"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          padding: 'clamp(1rem, 3vw, 2rem)',
        }}
      >
        <h2
          className="text-white font-bold mb-6 font-orbitron"
          style={{
            fontSize: 'clamp(1.5rem, 2vw, 2.5rem)',
            marginBottom: 'clamp(1rem, 3vw, 2rem)',
          }}
        >
          Login
        </h2>
        <form onSubmit={handleSubmit} style={{ gap: 'clamp(0.5rem, 1.5vw, 1rem)' }}>
          {error && (
            <div
              style={{
                padding: 'clamp(0.5rem, 1vw, 0.75rem)',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
              }}
            >
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="username"
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
              autoComplete="username"
              disabled={isLoading}
              style={{
                padding: 'clamp(0.5rem, 1vw, 0.75rem)',
                borderRadius: '0.375rem',
                width: '100%',
                backgroundColor: 'rgba(31, 41, 55, 0.5)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: 'white',
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="password"
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
              autoComplete="current-password"
              disabled={isLoading}
              style={{
                padding: 'clamp(0.5rem, 1vw, 0.75rem)',
                borderRadius: '0.375rem',
                width: '100%',
                backgroundColor: 'rgba(31, 41, 55, 0.5)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: 'white',
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
              }}
            />
          </div>
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-indigo-400 hover:text-indigo-300"
              style={{
                fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
              }}
            >
              Forgot Password?
            </button>
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
            {isLoading ? 'Loading...' : 'Login'}
          </button>
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="border-gray-500/50 rounded-md shadow-sm text-gray-300 hover:bg-gray-800"
              style={{
                padding: 'clamp(0.5rem, 1vw, 0.75rem)',
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
              }}
            >
              Continue as Guest
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              disabled={isLoading}
              className="border-indigo-500/50 rounded-md shadow-sm text-indigo-300 hover:bg-indigo-900/50"
              style={{
                padding: 'clamp(0.5rem, 1vw, 0.75rem)',
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
              }}
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
