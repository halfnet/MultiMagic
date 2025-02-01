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
          themeColor: users.themeColor,
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
        .select({
          id: users.id,
          username: users.username,
          themeColor: users.themeColor,
        })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user) {
        // Create new user if doesn't exist
        [user] = await db
          .insert(users)
          .values({ 
            username,
            themeColor: '#7c3aed', // Set default theme color
          })
          .returning({
            id: users.id,
            username: users.username,
            themeColor: users.themeColor,
          });
      }

      // Update last login time
      await db
        .update(users)
        .set({ lastLoginAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(users.id, user.id));

      res.json(user);
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ error: 'Failed to process login' });
    }
  });

  // Rest of the routes remain unchanged
  app.post('/api/game-results', async (req, res) => {
    try {
      // Calculate screen time earned
      let screenTime = 0;
      const hasSpeedMaster = req.body.timeTakenInMs < 60000; // Less than 1 minute
      const hasPerfectScore = req.body.incorrectAttempts === 0;
      const hasAllAchievements = hasSpeedMaster && hasPerfectScore;

      if (req.body.mode === 'regular') {
        if (req.body.difficulty === 'easy') {
          screenTime = hasAllAchievements ? 1.0 : 0.5;
        } else if (req.body.difficulty === 'hard') {
          screenTime = hasAllAchievements ? 6.0 : 2.0;
        }
      }

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
        screenTimeEarned: screenTime,
      }).returning();

      res.json(result);
    } catch (error) {
      console.error('Error saving game result:', error);
      res.status(500).json({ error: 'Failed to save game result' });
    }
  });

  app.post('/api/user/theme', async (req, res) => {
    try {
      const { userId, themeColor } = req.body;
      await db
        .update(users)
        .set({ themeColor })
        .where(eq(users.id, userId));
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving theme color:', error);
      res.status(500).json({ error: 'Failed to save theme color' });
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

  app.get('/api/screen-time', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const timezone = req.query.timezone as string || 'UTC';
      
      const result = await db.execute(sql`
        SELECT COALESCE(SUM(screen_time_earned::float), 0) as total_screen_time
        FROM game_results
        WHERE user_id = ${userId}
        AND created_at::timestamp >= date_trunc('week', TIMEZONE(${timezone}, CURRENT_TIMESTAMP AT TIME ZONE ${timezone}))
        AND created_at::timestamp < date_trunc('week', TIMEZONE(${timezone}, CURRENT_TIMESTAMP AT TIME ZONE ${timezone})) + INTERVAL '1 week'
      `);
      
      res.json({ screenTime: Number(result.rows[0].total_screen_time) });
    } catch (error) {
      console.error('Error fetching screen time:', error);
      res.status(500).json({ error: 'Failed to fetch screen time' });
    }
  });

  app.get('/api/daily-stats', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const userTimezone = req.query.timezone as string || 'UTC';

      const stats = await db.execute(sql`
        SELECT 
          COALESCE(COUNT(CASE WHEN difficulty = 'easy' THEN 1 END), 0) as easy_count,
          COALESCE(COUNT(CASE WHEN difficulty = 'hard' THEN 1 END), 0) as hard_count
        FROM game_results
        WHERE user_id = ${userId}
        AND created_at::timestamp >= TIMEZONE(${userTimezone}, (CURRENT_TIMESTAMP AT TIME ZONE ${userTimezone})::date::timestamp)
        AND created_at::timestamp < TIMEZONE(${userTimezone}, (CURRENT_TIMESTAMP AT TIME ZONE ${userTimezone})::date::timestamp) + INTERVAL '1 day'
      `);

      if (!stats || !stats.rowCount) {
        res.json({ easy_count: 0, hard_count: 0 });
      } else {
        res.json({
          easy_count: Number(stats.rows[0].easy_count || 0),
          hard_count: Number(stats.rows[0].hard_count || 0)
        });
      }
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      res.status(500).json({ error: 'Failed to fetch daily stats' });
    }
  });

  app.get('/api/analytics/games-by-day', async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const result = await db.execute(sql`
        WITH days AS (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '6 days',
            CURRENT_DATE,
            INTERVAL '1 day'
          )::date AS day
        )
        SELECT 
          days.day,
          COALESCE(COUNT(CASE WHEN gr.difficulty = 'easy' THEN 1 END), 0) as easy_count,
          COALESCE(COUNT(CASE WHEN gr.difficulty = 'hard' THEN 1 END), 0) as hard_count,
          COALESCE(COUNT(CASE WHEN gr.mode = 'practice' THEN 1 END), 0) as practice_count
        FROM days
        LEFT JOIN game_results gr ON 
          DATE(gr.created_at) = days.day
          ${userId ? sql`AND gr.user_id = ${userId}` : sql``}
        GROUP BY days.day
        ORDER BY days.day
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching games by day:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/analytics/response-times', async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const result = await db.execute(sql`
        WITH weeks AS (
          SELECT generate_series(
            CURRENT_DATE - INTERVAL '7 weeks',
            CURRENT_DATE,
            INTERVAL '1 week'
          )::date AS week_start
        )
        SELECT 
          weeks.week_start,
          gr.difficulty,
          ROUND(AVG(gqr.time_to_solve_ms::numeric / 1000), 2) as avg_time_seconds
        FROM weeks
        LEFT JOIN game_results gr ON 
          DATE(gr.created_at) >= weeks.week_start
          AND DATE(gr.created_at) < weeks.week_start + INTERVAL '1 week'
          ${userId ? sql`AND gr.user_id = ${userId}` : sql``}
        LEFT JOIN game_question_results gqr ON gr.game_id = gqr.game_id
        WHERE gr.mode = 'regular'
        GROUP BY weeks.week_start, gr.difficulty
        ORDER BY weeks.week_start, gr.difficulty
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching response times:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/analytics/slowest-numbers', async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const result = await db.execute(sql`
        WITH NumberStats AS (
          SELECT 
            gr.difficulty,
            n.number,
            AVG(gqr.time_to_solve_ms)::float as avg_time_ms
          FROM game_results gr
          JOIN game_question_results gqr ON gr.game_id = gqr.game_id
          CROSS JOIN LATERAL (
            VALUES 
              (gqr.num1),
              (gqr.num2)
          ) as n(number)
          WHERE gr.mode = 'regular'
          AND gr.created_at::timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 week'
          ${userId ? sql`AND gr.user_id = ${userId}` : sql``}
          GROUP BY gr.difficulty, n.number
        )
        SELECT 
          difficulty,
          number,
          avg_time_ms
        FROM (
          SELECT 
            difficulty,
            number,
            avg_time_ms,
            ROW_NUMBER() OVER (PARTITION BY difficulty ORDER BY avg_time_ms DESC) as rn
          FROM NumberStats
        ) ranked
        WHERE rn <= 2
        ORDER BY difficulty, avg_time_ms DESC;
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching slowest numbers:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}