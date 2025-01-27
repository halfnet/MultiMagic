import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from '../db';
import { users, gameResults, gameQuestionResults } from '../db/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export function registerRoutes(app: Express): Server {
  // Get all users for the dropdown
  app.get('/api/users', async (req, res) => {
    try {
      const allUsers = await db
        .select({
          id: users.id,
          username: users.username,
        })
        .from(users)
        .orderBy(users.username);

      res.json(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Simple login route that creates user if doesn't exist
  app.post('/api/login', async (req, res, next) => {
    try {
      const { username } = req.body;

      if (!username || typeof username !== 'string' || username.length < 2) {
        return res.status(400).json({ error: 'Invalid username' });
      }

      // Check if user exists
      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user) {
        // Create new user if doesn't exist
        [user] = await db
          .insert(users)
          .values({ username })
          .returning();
      } else {
        // Update last login time
        await db
          .update(users)
          .set({ lastLoginAt: sql`CURRENT_TIMESTAMP` })
          .where(eq(users.id, user.id));
      }

      res.json(user);
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ error: 'Failed to process login' });
    }
  });

  app.post('/api/game-results', async (req, res) => {
    try {
      const [result] = await db.insert(gameResults).values({
        gameId: req.body.gameId,
        userId: req.body.userId,
        difficulty: req.body.difficulty,
        mode: req.body.mode,
        practiceDigit: req.body.practiceDigit,
        questionsCount: req.body.questionsCount,
        correctAnswers: req.body.correctAnswers,
        timeTakenInMs: req.body.timeTakenInMs,
        bestStreak: req.body.bestStreak,
        incorrectAttempts: req.body.incorrectAttempts,
      }).returning();

      res.json(result);
    } catch (error) {
      console.error('Error saving game result:', error);
      res.status(500).json({ error: 'Failed to save game result' });
    }
  });

  app.post('/api/game-question-results', async (req, res) => {
    try {
      const results = await db.insert(gameQuestionResults).values(
        req.body.questionResults.map((q: any) => ({
          gameId: req.body.gameId,
          userId: req.body.userId,
          questionNumber: q.questionId,
          num1: q.numbersUsed[0],
          num2: q.numbersUsed[1],
          attempts: q.attempts,
          timeToSolveMs: q.timeTaken,
        }))
      );
      res.json(results);
    } catch (error) {
      console.error('Error saving question results:', error);
      res.status(500).json({ error: 'Failed to save question results' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}