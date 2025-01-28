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
      console.log('Saving game result:', req.body);
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

      console.log('Game result saved:', result);
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

  app.get('/api/daily-stats', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const userTimezone = req.query.timezone as string || 'UTC';
      
      const stats = await db.execute(sql`
        WITH user_day AS (
          SELECT DATE_TRUNC('day', TIMEZONE(${userTimezone}, created_at::timestamp)) as game_date,
                 difficulty,
                 COUNT(*) as count
          FROM game_results 
          WHERE user_id = ${userId}
          AND created_at::timestamp >= TIMEZONE(${userTimezone}, CURRENT_DATE::timestamp)
          AND created_at::timestamp < TIMEZONE(${userTimezone}, (CURRENT_DATE + INTERVAL '1 day')::timestamp)
          GROUP BY 1, 2
        )
        SELECT 
          COALESCE(SUM(CASE WHEN difficulty = 'easy' THEN count ELSE 0 END), 0) as easy_count,
          COALESCE(SUM(CASE WHEN difficulty = 'hard' THEN count ELSE 0 END), 0) as hard_count
        FROM user_day
      `);

      res.json(stats[0]);
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      res.status(500).json({ error: 'Failed to fetch daily stats' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}