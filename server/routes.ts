import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from '../db';
import { users, gameResults } from '../db/schema';
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
  app.post('/api/login', async (req, res) => {
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
      const result = await db.insert(gameResults).values({
        userId: req.body.userId,
        difficulty: req.body.difficulty,
        mode: req.body.mode,
        practiceDigit: req.body.practiceDigit,
        questionsCount: req.body.questionsCount,
        correctAnswers: req.body.correctAnswers,
        timeTakenInMs: req.body.timeTakenInMs,
        bestStreak: req.body.bestStreak,
        incorrectAttempts: req.body.incorrectAttempts,
      });
      res.json(result);
    } catch (error) {
      console.error('Error saving game result:', error);
      res.status(500).json({ error: 'Failed to save game result' });
    }
  });

  // Check username availability

  app.post('/api/game-question-results', async (req, res) => {
    try {
      const results = await db.insert(gameQuestionResults).values(
        req.body.questions.map((q: any, index: number) => ({
          gameId: req.body.gameId,
          userId: req.body.userId,
          questionNumber: index + 1,
          num1: q.num1,
          num2: q.num2,
          attempts: q.attempts,
          timeToSolveMs: q.endTime - q.startTime,
        }))
      );
      res.json(results);
    } catch (error) {
      console.error('Error saving question results:', error);
      res.status(500).json({ error: 'Failed to save question results' });
    }
  });

  app.get('/api/check-username/:username', async (req, res) => {
    try {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, req.params.username))
        .limit(1);

      res.json({ available: !existingUser });
    } catch (error) {
      console.error('Error checking username:', error);
      res.status(500).json({ error: 'Failed to check username' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}