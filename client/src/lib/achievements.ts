import { Trophy, Star, Clock, Brain } from 'lucide-react';
import { GameState } from './game';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (gameState: GameState) => boolean;
}

export interface PlayerAchievements {
  earned: string[];
  lastEarned?: Achievement;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'speed-master',
    name: 'Speed Master',
    description: 'Complete the game in under 1 minute',
    icon: 'Clock',
    condition: (gameState: GameState) => {
      if (!gameState.endTime || gameState.mode === 'practice') return false;
      const timeInSeconds = (gameState.endTime - gameState.startTime) / 1000;
      return timeInSeconds < 60;
    },
  },
  {
    id: 'amc-scholar',
    name: 'AMC Scholar',
    description: 'Perfect score on all AMC questions',
    icon: 'Star',
    condition: (gameState: GameState) => {
      return (
        gameState.endTime !== undefined &&
        gameState.mode === 'amc' &&
        gameState.currentQuestion === gameState.questions.length &&
        gameState.incorrectAttempts === 0
      );
    },
  },
  {
    id: 'amc-expert',
    name: 'AMC Expert',
    description: 'Perfect score within 8 minutes',
    icon: 'Star',
    condition: (gameState: GameState) => {
      if (!gameState.endTime || gameState.mode !== 'amc') return false;
      const timeInMinutes = (gameState.endTime - gameState.startTime) / (1000 * 60);
      return timeInMinutes < 8 && gameState.incorrectAttempts === 0;
    },
  },
  {
    id: 'amc-master',
    name: 'AMC Master',
    description: 'Perfect score within 5 minutes',
    icon: 'Star',
    condition: (gameState: GameState) => {
      if (!gameState.endTime || gameState.mode !== 'amc') return false;
      const timeInMinutes = (gameState.endTime - gameState.startTime) / (1000 * 60);
      return timeInMinutes < 5 && gameState.incorrectAttempts === 0;
    },
  },
  {
    id: 'practice-champion',
    name: 'Practice Champion',
    description: 'Master a number with 5 correct answers in a row',
    icon: 'Brain',
    condition: (gameState: GameState) => {
      return gameState.mode === 'practice' && gameState.streak >= 5;
    },
  },
];

export const checkAchievements = (
  gameState: GameState,
  currentAchievements: string[]
): Achievement | undefined => {
  for (const achievement of ACHIEVEMENTS) {
    if (!currentAchievements.includes(achievement.id) && achievement.condition(gameState)) {
      return achievement;
    }
  }
  return undefined;
};
