import React, { useState } from 'react';
import { Volume2, VolumeX, X, Music, Gamepad } from 'lucide-react';

type SettingsProps = {
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onClose: () => void;
  onSaveSettings?: (settings: GameSettings) => void;
  isSaving?: boolean;
};

type GameSettings = {
  soundEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
};

export function Settings({ 
  isSoundEnabled, 
  onToggleSound, 
  onClose,
  onSaveSettings,
  isSaving = false 
}: SettingsProps) {
  const [musicVolume, setMusicVolume] = useState(100);
  const [effectsVolume, setEffectsVolume] = useState(100);

  const handleSave = () => {
    onSaveSettings?.({
      soundEnabled: isSoundEnabled,
      musicVolume,
      effectsVolume
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50
      animate-fadeIn motion-reduce:animate-none">
      <div className="bg-black/90 rounded-lg p-6 w-96 border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white font-orbitron">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close settings"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Settings Options */}
        <div className="space-y-6">
          {/* Master Sound Control */}
          <div className="flex items-center justify-between group">
            <div className="space-y-1">
              <span className="text-white font-tech-mono flex items-center gap-2">
                <Gamepad size={20} />
                Master Sound
              </span>
              <p className="text-gray-400 text-sm">
                {isSoundEnabled ? 'Game audio is enabled' : 'Game audio is disabled'}
              </p>
            </div>
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-full transition-all duration-200 
                ${isSoundEnabled 
                  ? 'bg-indigo-600/50 text-white hover:bg-indigo-500/50' 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}
              aria-label={isSoundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          {/* Music Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-tech-mono flex items-center gap-2">
                <Music size={20} />
                Music Volume
              </span>
              <span className="text-gray-400 text-sm font-mono">{musicVolume}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={musicVolume}
              onChange={(e) => setMusicVolume(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-gray-700/50 h-2 rounded-lg appearance-none 
                cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isSoundEnabled}
            />
          </div>

          {/* Sound Effects Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-tech-mono flex items-center gap-2">
                <Volume2 size={20} />
                Effects Volume
              </span>
              <span className="text-gray-400 text-sm font-mono">{effectsVolume}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={effectsVolume}
              onChange={(e) => setEffectsVolume(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-gray-700/50 h-2 rounded-lg appearance-none 
                cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isSoundEnabled}
            />
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="w-1/3 py-2.5 bg-gray-800/80 text-gray-300 rounded-lg 
              hover:bg-gray-700/80 transition-all duration-200 font-tech-mono
              border border-gray-600/30 hover:border-gray-500/30
              focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2 
              focus:ring-offset-black/90 transform hover:scale-[1.02]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-2/3 py-2.5 bg-indigo-600/80 text-white rounded-lg 
              hover:bg-indigo-500/80 transition-all duration-200 font-tech-mono
              border border-indigo-400/30 hover:border-indigo-300/30
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 
              focus:ring-offset-black/90 transform hover:scale-[1.02]
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
