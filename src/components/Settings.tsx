import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

type SettingsProps = {
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onClose: () => void;
};

export function Settings({ isSoundEnabled, onToggleSound, onClose }: SettingsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Sound</span>
            <button
              onClick={onToggleSound}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={isSoundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {isSoundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}