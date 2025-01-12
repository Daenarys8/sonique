export interface SoundManager {
  play: (soundType: string) => void;
  setEnabled: (enabled: boolean) => void;
}

export type SoundEffect = {
  [key: string]: string;
};