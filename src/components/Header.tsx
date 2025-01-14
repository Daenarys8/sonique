import React from 'react';
import { Coins, Settings, User } from 'lucide-react';
import '../styles/header.css';

type HeaderProps = {
  coins: number;
  onSettingsClick: () => void;
  onProfileClick: () => void;
  isGuest?: boolean;
};

export function Header({ 
  coins, 
  onSettingsClick, 
  onProfileClick, 
  isGuest = false 
}: HeaderProps) {
  return (
    <header className="header-container">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-overlay" />

      {/* Content */}
      <div className="header-content">
        {/* Title */}
        <h1 className="header-title">
          <span className="futuristic-title-green">son</span>
          <span className="futuristic-title-orange">IQ</span>
          <span className="futuristic-title-green">ue</span>
        </h1>

        <div className="action-buttons">
          {/* Coins display */}
          <div className="coins-container">
            <Coins className="icon text-yellow-400" />
            <span className="font-bold text-yellow-400">{coins}</span>
          </div>

          {/* Settings button */}
          <button onClick={onSettingsClick} className="settings-button">
            <Settings className="icon" />
          </button>

          {/* Profile button */}
          <button onClick={onProfileClick} className="profile-button">
            <User className="icon" />
            {isGuest && (
              <span className="guest-badge">Guest</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
