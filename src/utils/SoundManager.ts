import type { SoundManager as SoundManagerType } from '../types/sound';

export class SoundManager implements SoundManagerType {
  private sounds: { [key: string]: string };
  private enabled: boolean = true;

  constructor(sounds: { [key: string]: string }) {
    this.sounds = sounds;
  }

  play(soundType: string): void {
    if (!this.enabled || !this.sounds[soundType]) return;
    
    const audio = new Audio(this.sounds[soundType]);
    audio.play().catch(error => {
      console.warn(`Failed to play sound ${soundType}:`, error);
    });
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}