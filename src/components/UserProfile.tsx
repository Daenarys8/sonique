import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-indigo-100 p-3 rounded-full">
          <User className="w-8 h-8 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {isAuthenticated ? user?.username : 'Guest'}
          </h2>
          <p className="text-gray-500">
            {isAuthenticated ? user?.email : 'Playing as guest'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600">Total Games</span>
          <span className="font-semibold">{user?.stats?.totalGames || 0}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600">Total Score</span>
          <span className="font-semibold">{user?.stats?.totalScore || 0}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600">Coins Earned</span>
          <span className="font-semibold">{user?.stats?.totalCoins || 0}</span>
        </div>
      </div>

      {isAuthenticated && (
        <button
          onClick={logout}
          className="mt-6 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      )}
    </div>
  );
}