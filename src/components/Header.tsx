import React from 'react';
import { Coins, Settings, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Add this import
import './header.css';

// components/Header.tsx
type HeaderProps = {
  coins: number;
  onSettingsClick: () => void;
  onProfileClick: () => void;
  isGuest?: boolean; // Add this prop since GuestGame is passing it
};

export function Header({ 
  coins, 
  onSettingsClick, 
  onProfileClick,
  isGuest = false // Default to false
}: HeaderProps) {
  return (
    <header className="relative w-full px-6 py-4 text-white header-container">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-overlay" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="flex items-center">
          <span className="futuristic-title-green text-2xl font-bold tracking-wider">son</span>
          <span className="futuristic-title-orange text-3xl font-extrabold tracking-wider">IQ</span>
          <span className="futuristic-title-green text-2xl font-bold tracking-wider">ue</span>
        </h1>
        
        <div className="flex items-center gap-6">
          {/* Coins display with glowing effect */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-yellow-400">{coins}</span>
          </div>
          
          {/* Settings button */}
          <button
            onClick={onSettingsClick}
            className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 backdrop-blur-sm
                     hover:scale-110 active:scale-95 border border-white/10"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          {/* Profile button */}
          <button
            onClick={onProfileClick}
            className="relative p-2 hover:bg-white/10 rounded-full transition-all duration-300 
                     backdrop-blur-sm hover:scale-110 active:scale-95 border border-white/10
                     flex items-center"
            title={isGuest ? "Login to access profile" : "Profile"}
          >
            <User className="w-5 h-5" />
            {isGuest && (
              <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-semibold">
                Guest
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

