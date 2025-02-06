import { CORRECT_SOUND, INCORRECT_SOUND, COMPLETE_SOUND } from './audioData';

// Audio helper functions for game sounds
let audioContext: AudioContext | null = null;

// Initialize AudioContext
const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

// Function to play a sound from a data URL
const playSound = async (dataUrl: string) => {
  try {
    const context = initAudioContext();
    const response = await fetch(dataUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.start(0);
  } catch (error) {
    console.error('Failed to play sound:', error);
  }
};

// Sound effect functions with unique sounds for each event
export const playCorrectSound = () => playSound(CORRECT_SOUND); // High-pitched "ding" for correct answers
export const playIncorrectSound = () => playSound(INCORRECT_SOUND); // Gentle low tone for incorrect answers
export const playCompleteSound = () => playSound(COMPLETE_SOUND); // Celebratory fanfare for game completion
