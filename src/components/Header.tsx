import React from 'react';
import { Coins, Settings, User } from 'lucide-react';

type HeaderProps = {
  coins: number;
  onSettingsClick: () => void;
  onProfileClick: () => void;
};

export function Header({ coins, onSettingsClick, onProfileClick }: HeaderProps) {
  return (
    <header className="w-full px-6 py-4 bg-indigo-600 text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sonique</h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            <span className="font-semibold">{coins}</span>
          </div>
          <button
            onClick={onSettingsClick}
            className="p-2 hover:bg-indigo-700 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={onProfileClick}
            className="p-2 hover:bg-indigo-700 rounded-full transition-colors"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}