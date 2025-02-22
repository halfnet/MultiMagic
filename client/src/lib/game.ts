export type Difficulty = 'easy' | 'hard';
export type GameMode = 'regular' | 'practice' | 'challenge';

export interface Question {
  num1: number;
  num2: number;
  answer: number;
}

export interface QuestionState {
  attempts: number;
  startTime: number;
  endTime?: number;
}

export interface GameState {
  gameId: string;
  currentQuestion: number;
  questions: Question[];
  questionStates: QuestionState[];
  startTime: number;
  endTime?: number;
  difficulty: Difficulty;
  streak: number;
  bestStreak: number;
  themeColor: string;
  mode: GameMode;
  practiceDigit?: number;
  practiceQuestionCount?: number;
  achievementsEarned: string[];
  lastEarnedAchievement?: Achievement;
  incorrectAttempts: number;
}

// Remove duplicate Achievement interface and import from achievements.ts
import { Achievement } from './achievements';

export const generateQuestion = (difficulty: Difficulty, practiceDigit?: number): Question => {
  const max = difficulty === 'easy' ? 12 : 19;
  const min = difficulty === 'easy' ? 3 : 3;

  if (practiceDigit !== undefined) {
    // For practice mode, one number is always the practice digit
    const useFirstNumber = Math.random() < 0.5;
    const otherNumber = Math.floor(Math.random() * max) + 1;

    const num1 = useFirstNumber ? practiceDigit : otherNumber;
    const num2 = useFirstNumber ? otherNumber : practiceDigit;

    return {
      num1,
      num2,
      answer: num1 * num2,
    };
  }

  // Regular mode
  let num1, num2;
  if (difficulty === 'hard') {
    do {
      num1 = Math.floor(Math.random() * (max - min + 1)) + min;
      num2 = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (num1 + num2 < 13);
  } else {
    num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    num2 = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return {
    num1,
    num2,
    answer: num1 * num2,
  };
};

export const generateQuestions = (
  difficulty: Difficulty,
  count: number = 10,
  practiceDigit?: number
): Question[] => {
  const usedPairs = new Set<string>();
  const questions: Question[] = [];

  while (questions.length < count) {
    const question = generateQuestion(difficulty, practiceDigit);
    const pair = [question.num1, question.num2].sort().join('x');

    if (!usedPairs.has(pair)) {
      usedPairs.add(pair);
      questions.push(question);
    }
  }

  return questions;
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
