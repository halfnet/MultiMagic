export type Difficulty = 'easy' | 'hard';

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
  score: number;
  difficulty: Difficulty;
  streak: number;
}

export const generateQuestion = (difficulty: Difficulty): Question => {
  const max = difficulty === 'easy' ? 9 : 20;
  const num1 = Math.floor(Math.random() * max) + 1;
  const num2 = Math.floor(Math.random() * max) + 1;
  return {
    num1,
    num2,
    answer: num1 * num2
  };
};

export const generateQuestions = (difficulty: Difficulty, count: number = 20): Question[] => {
  return Array.from({ length: count }, () => generateQuestion(difficulty));
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
