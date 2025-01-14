import React from 'react';
import { User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '../types/game';
import '../styles/Profile.css'; // Import the CSS file

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

export function Profile({ onClose, onLogin, onSignup }: ProfileProps) {
  const navigate = useNavigate();
  const { currentUser, isGuest, logout, loading } = useAuth();
  const userProfile = (currentUser as AuthUser)?.profile;

  const handleLogout = async () => {
    try {
      await logout();
      onClose(); // Close the profile modal
      navigate('/login', { replace: true }); // Redirect to login page
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderUserStats = () => {
    if (isGuest) {
      return null; // Don't try to show stats for guest users
    }
    
    const stats = userProfile?.stats;

    return (
      <div className="profile-stats">
        <div className="profile-stat">
          <span>Total Games</span>
          <span>{stats?.totalGames || 0}</span>
        </div>
        <div className="profile-stat">
          <span>Total Score</span>
          <span>{stats?.totalScore || 0}</span>
        </div>
        <div className="profile-stat">
          <span>Coins Earned</span>
          <span>{stats?.totalCoins || 0}</span>
        </div>
        {stats?.completedCategories && stats.completedCategories.length > 0 && (
          <div className="profile-stat">
            <span>Completed Categories</span>
            <span>{stats.completedCategories.length}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="profile-logout-button"
        >
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    );
  };

  return (
    <div className="profile-modal">
      <div className="profile-content">
        {/* Header */}
        <div className="profile-header">
          <h2 className="profile-title">Profile</h2>
          <button onClick={onClose} aria-label="Close profile">
            <X size={24} />
          </button>
        </div>

        <div className="profile-info">
          <div className="bg-indigo-100 p-3 rounded-full">
            <User className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2>{isGuest ? 'Guest Player' : currentUser?.username}</h2>
            <p>{isGuest ? 'Playing in guest mode' : currentUser?.email}</p>
          </div>
        </div>

        {isGuest ? (
          <div className="profile-guest-warning">
            <p>Playing as a guest means your progress won't be saved. Create an account to:</p>
            <ul>
              <li>Save your progress</li>
              <li>Track your statistics</li>
              <li>Compete on leaderboards</li>
              <li>Access more challenges</li>
            </ul>
            <div className="profile-cta-buttons">
              <button
                onClick={() => {
                  onClose();
                  if (onSignup) {
                    onSignup();
                  } else {
                    navigate('/signup');
                  }
                }}
                className="sign-up-button"
              >
                Sign Up
              </button>
              <button
                onClick={() => {
                  onClose();
                  if (onLogin) {
                    onLogin();
                  } else {
                    navigate('/login');
                  }
                }}
                className="login-button"
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
