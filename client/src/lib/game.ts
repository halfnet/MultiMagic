export type Difficulty = 'easy' | 'hard';
export type GameMode = 'regular' | 'practice' | 'challenge';

export interface Question {
  num1: number;
  num2: number;
  answer: number;
}

export interface GameState {
  currentQuestion: number;
  questions: Question[];
  startTime: number;
  endTime?: number;
  difficulty: Difficulty;
  streak: number;
  bestStreak: number;
  themeColor: string;
  mode: GameMode;
  practiceDigit?: number;
  achievementsEarned: string[];
  lastEarnedAchievement?: Achievement;
  incorrectAttempts: number;
}

// Remove duplicate Achievement interface and import from achievements.ts
import { Achievement } from './achievements';

export const generateQuestion = (difficulty: Difficulty, practiceDigit?: number): Question => {
  const max = difficulty === 'easy' ? 9 : 20;

  if (practiceDigit !== undefined) {
    // For practice mode, one number is always the practice digit
    const useFirstNumber = Math.random() < 0.5;
    const otherNumber = Math.floor(Math.random() * max) + 1;

    const num1 = useFirstNumber ? practiceDigit : otherNumber;
    const num2 = useFirstNumber ? otherNumber : practiceDigit;

    return {
      num1,
      num2,
      answer: num1 * num2
    };
  }

  // Regular mode
  const num1 = Math.floor(Math.random() * max) + 1;
  const num2 = Math.floor(Math.random() * max) + 1;
  return {
    num1,
    num2,
    answer: num1 * num2
  };
};

export const generateQuestions = (difficulty: Difficulty, count: number = 10, practiceDigit?: number): Question[] => {
  return Array.from({ length: count }, () => generateQuestion(difficulty, practiceDigit));
};

export const checkAnswer = (question: Question, userAnswer: number): boolean => {
  return question.answer === userAnswer;
};

export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const calculateScore = (correct: number, timeMs: number): number => {
  const baseScore = correct * 100;
  const timeBonus = Math.max(0, 2000 - Math.floor(timeMs / 1000)) * 5;
  return baseScore + timeBonus;
};