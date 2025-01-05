import React, { useState, useEffect } from 'react';
import { confirmSignUp, resendSignUpCode, signIn } from 'aws-amplify/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { createUserProfile } from '../services/aws/userService';
import { useAuth } from '../contexts/AuthContext';


export function ConfirmSignup() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth(); // Add this line to get login from AuthContext
  const username = location.state?.username;
  const [confirmationStep, setConfirmationStep] = useState<
    'confirming' | 'signing-in' | 'creating-profile' | 'complete'
  >('confirming');

  // Redirect to signup if username is missing
  useEffect(() => {
    if (!username) {
      setError('Missing username. Please try signing up again.');
      setTimeout(() => navigate('/signup'), 3000);
    }
  }, [username, navigate]);

  const getButtonText = () => {
    if (!isLoading) return 'Confirm Account';
    
    switch (confirmationStep) {
      case 'confirming':
        return 'Confirming...';
      case 'signing-in':
        return 'Signing in...';
      case 'creating-profile':
        return 'Creating profile...';
      case 'complete':
        return 'Redirecting...';
      default:
        return 'Processing...';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true);
    setError(null);
    
    try {
      // Confirming signup
      setConfirmationStep('confirming');
      await confirmSignUp({ username, confirmationCode: code });
      
      // Signing in
      setConfirmationStep('signing-in');
      const storedPassword = sessionStorage.getItem('tempPassword');
      if (!storedPassword) {
        throw new Error('Login credentials not found');
      }

      // Use login from AuthContext instead of direct signIn
      await login(username, storedPassword);

      // Creating profile
      setConfirmationStep('creating-profile');
      const pendingProfile = sessionStorage.getItem('pendingUserProfile');
      if (pendingProfile) {
        const profileData = JSON.parse(pendingProfile);
        await createUserProfile(username, {
          ...profileData,
          username
        });
        
        // Clean up stored data
        sessionStorage.removeItem('pendingUserProfile');
        sessionStorage.removeItem('tempPassword');
      }

      // Show success message and redirect
      setConfirmationStep('complete');
      setShowSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/game', { replace: true });
    } catch (error) {
      console.error('Error during confirmation process:', error);
      if (error instanceof Error) {
        if (error.message.includes('authentication')) {
          setError('Authentication failed. Please try signing in manually.');
          setTimeout(() => navigate('/login', { replace: true }), 1500);
        } else {
          setError('Failed to confirm signup. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src="/assets/background.gif"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="bg-opacity-80 bg-black container max-w-md w-full p-6 rounded-lg shadow-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-indigo-500/30">
        <h2 className="text-2xl font-bold text-white mb-6 font-orbitron">
          Confirm Your Account
        </h2>
        <p className="text-gray-300 mb-4">
          Please enter the confirmation code sent to your email.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-900/50 text-red-200 rounded-lg border border-red-500/50">
              {error}
            </div>
          )}
          {showSuccess && (
            <div className="p-3 bg-green-900/50 text-green-200 rounded-lg border border-green-500/50">
              Account confirmed successfully! Redirecting to game...
            </div>
          )}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-white font-tech-mono">
              Confirmation Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled={isLoading}
              className="mt-1 block w-full rounded-md bg-gray-900/50 border-indigo-500/50 text-white shadow-sm 
                focus:border-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50 
                placeholder-gray-400 disabled:opacity-50"
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
            {getButtonText()}
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await resendSignUpCode({ username });
                setError('A new confirmation code has been sent to your email.');
              } catch (err) {
                console.error('Error resending code:', err);
                setError('Failed to resend code. Please try again.');
              }
            }}
            disabled={isLoading}
            className="w-full mt-2 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white 
              bg-transparent hover:bg-indigo-900/30 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50
              transition-all duration-200 ease-in-out transform hover:scale-[1.02] 
              font-tech-mono border border-indigo-400/50 hover:border-indigo-300"
          >
            Resend Code
          </button>
        </form>
      </div>
    </div>
  );
}
