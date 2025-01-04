// Audio utilities for playing game sounds

export const initializeBackgroundMusic = (audioPath: string): HTMLAudioElement => {
  const audio = new Audio(audioPath);
  audio.loop = true;
  return audio;
};

export const playBackgroundMusic = (audio: HTMLAudioElement) => {
  audio.play().catch(error => {
    console.error('Error playing audio:', error);
  });
};

export const stopBackgroundMusic = (audio: HTMLAudioElement) => {
  audio.pause();
  audio.currentTime = 0;
};