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
    description: 'Complete the game in under 2 minutes',
    icon: 'Clock',
    condition: (gameState: GameState) => {
      if (!gameState.endTime) return false;
      const timeInSeconds = (gameState.endTime - gameState.startTime) / 1000;
      return timeInSeconds < 120; // Changed back to 120 seconds (2 minutes)
    }
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Complete the game without any mistakes',
    icon: 'Star',
    condition: (gameState: GameState) => {
      // Check if the game is complete and score equals total questions
      return gameState.endTime !== undefined && gameState.score === gameState.questions.length;
    }
  },
  {
    id: 'practice-champion',
    name: 'Practice Champion',
    description: 'Master a number with 5 correct answers in a row',
    icon: 'Brain',
    condition: (gameState: GameState) => {
      return gameState.mode === 'practice' && gameState.streak >= 5;
    }
  }
];

export const checkAchievements = (gameState: GameState, currentAchievements: string[]): Achievement | undefined => {
  for (const achievement of ACHIEVEMENTS) {
    if (!currentAchievements.includes(achievement.id) && achievement.condition(gameState)) {
      return achievement;
    }
  }
  return undefined;
};