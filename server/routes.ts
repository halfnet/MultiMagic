import type { Express } from "express";
import { createServer, type Server } from "http";

import { db } from '../db';
import { gameResults } from '../db/schema';

export function registerRoutes(app: Express): Server {
  app.post('/api/game-results', async (req, res) => {
    try {
      const result = await db.insert(gameResults).values({
        userId: req.body.userId,
        difficulty: req.body.difficulty,
        mode: req.body.mode,
        practiceDigit: req.body.practiceDigit,
        questionsCount: req.body.questionsCount,
        correctAnswers: req.body.correctAnswers,
        timeTaken: req.body.timeTaken,
        bestStreak: req.body.bestStreak,
        incorrectAttempts: req.body.incorrectAttempts,
      });
      res.json(result);
    } catch (error) {
      console.error('Error saving game result:', error);
      res.status(500).json({ error: 'Failed to save game result' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
