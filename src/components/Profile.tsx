import React from 'react';
import { User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '../types/game'; // adjust import path as needed

type ProfileProps = {
  onClose: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
};

interface AuthUser {
  username: string;
  email?: string;
  profile?: UserProfile;
}

export function Profile({ onClose, onLogin, onSignup, onLogout }: ProfileProps) {
  const navigate = useNavigate();
  const { currentUser, isGuest } = useAuth();
  const userProfile = (currentUser as AuthUser)?.profile;


  const renderUserStats = () => {
    if (isGuest) {
      return null; // Don't try to show stats for guest users
    }
    
    const stats = userProfile?.stats;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600">Total Games</span>
          <span className="font-semibold">
            {stats?.totalGames || 0}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600">Total Score</span>
          <span className="font-semibold">
          {stats?.totalScore || 0}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600">Coins Earned</span>
          <span className="font-semibold">
          {stats?.totalCoins || 0}
          </span>
        </div>
        {stats?.completedCategories && stats.completedCategories.length > 0 && (
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Completed Categories</span>
            <span className="font-semibold text-white">
              {stats.completedCategories.length}
            </span>
          </div>
        )}
        <button
            onClick={() => onLogout ? onLogout() : navigate('/login')}
            className="mt-6 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50
        animate-fadeIn motion-reduce:animate-none">
      <div 
        className="bg-black/90 rounded-lg p-6 w-96 border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-orbitron">Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close profile"
          >
            <X size={24} />
          </button>
        </div>
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-indigo-100 p-3 rounded-full">
          <User className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {isGuest ? 'Guest Player' : currentUser?.username}
          </h2>
          <p className="text-gray-500">
            {isGuest ? 'Playing in guest mode' : currentUser?.email}
          </p>
        </div>
      </div>

      {isGuest ? (
        <div className="space-y-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-yellow-800">
              Playing as a guest means your progress won't be saved. 
              Create an account to:
            </p>
            <ul className="mt-2 list-disc list-inside text-yellow-700">
              <li>Save your progress</li>
              <li>Track your statistics</li>
              <li>Compete on leaderboards</li>
              <li>Access more challenges</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
          <button
              onClick={() => onSignup ? onSignup() : navigate('/signup')}
              className="py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign Up
            </button>
            <button
              onClick={() => onLogin ? onLogin() : navigate('/login')}
              className="py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      ) : (
        renderUserStats()
        )}
    </div>
    </div>
  );
}