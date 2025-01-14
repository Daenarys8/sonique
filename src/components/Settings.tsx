import React, { useState } from 'react';
import { Volume2, VolumeX, X, Music, Gamepad } from 'lucide-react';
import '../styles/settings.css'; // Updated CSS file import

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
    <div className="settings-overlay">
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button onClick={onClose} className="settings-close-btn" aria-label="Close settings">
            <X size={24} />
          </button>
        </div>
        
        {/* Settings Options */}
        <div className="settings-options">
          {/* Master Sound Control */}
          <div className="sound-control group">
            <div className="sound-description">
              <span className="sound-label">
                <Gamepad size={20} />
                Master Sound
              </span>
              <p className="sound-status">
                {isSoundEnabled ? 'Game audio is enabled' : 'Game audio is disabled'}
              </p>
            </div>
            <button
              onClick={onToggleSound}
              className={`sound-toggle-btn ${isSoundEnabled ? 'enabled' : 'disabled'}`}
              aria-label={isSoundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
          </div>

          <div className="divider" />

          {/* Music Volume */}
          <div className="volume-control">
            <div className="volume-header">
              <span className="volume-label">
                <Music size={20} />
                Music Volume
              </span>
              <span className="volume-value">
                {musicVolume}%
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={musicVolume}
              onChange={(e) => setMusicVolume(Number(e.target.value))}
              className="volume-slider"
              disabled={!isSoundEnabled}
            />
          </div>

          {/* Sound Effects Volume */}
          <div className="volume-control">
            <div className="volume-header">
              <span className="volume-label">
                <Volume2 size={20} />
                Effects Volume
              </span>
              <span className="volume-value">
                {effectsVolume}%
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={effectsVolume}
              onChange={(e) => setEffectsVolume(Number(e.target.value))}
              className="volume-slider"
              disabled={!isSoundEnabled}
            />
          </div>

          <div className="divider" />
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <button
            onClick={onClose}
            className="cancel-btn"
            style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1rem)' }} // Clamped font size
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="save-btn"
          >
            {isSaving ? (
              <span className="saving-indicator">
                <div className="saving-spinner" />
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
