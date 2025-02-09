import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { db } from '../db';
import { users, gameResults, gameQuestionResults, amcGameResults, amcGameQuestionResults } from '../db/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger';

/**
 * @swagger
 * /api/game-question-results/{gameId}:
 *   get:
 *     summary: Get game question results for a specific game
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of game question results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameQuestionResult'
 *
 * /api/game-question-results/user/{userId}:
 *   get:
 *     summary: Get game question results for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of game question results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameQuestionResult'
 *
 * /api/game-question-results:
 *   post:
 *     summary: Save game question results
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameId:
 *                 type: string
 *               userId:
 *                 type: integer
 *               questionResults:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: integer
 *                     numbersUsed:
 *                       type: array
 *                       items:
 *                         type: integer
 *                     attempts:
 *                       type: integer
 *                     timeTaken:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Saved game question results
 *
 * /api/csrf-token:
 *   get:
 *     summary: Get CSRF token
 *     description: Retrieves a CSRF token required for POST/PUT/DELETE requests
 *     responses:
 *       200:
 *         description: CSRF token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         themeColor:
 *           type: string
 *         lastLoginAt:
 *           type: string
 *     GameQuestionResult:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         gameId:
 *           type: string
 *         userId:
 *           type: integer
 *         questionNumber:
 *           type: integer
 *         num1:
 *           type: integer
 *         num2:
 *           type: integer
 *         attempts:
 *           type: integer
 *         timeToSolveMs:
 *           type: integer
 *         createdAt:
 *           type: string
 *     GameResult:
 *       type: object
 *       properties:
 *         gameId:
 *           type: string
 *         userId:
 *           type: integer
 *         difficulty:
 *           type: string
 *         mode:
 *           type: string
 *         practiceDigit:
 *           type: integer
 *         questionsCount:
 *           type: integer
 *         correctAnswers:
 *           type: integer
 *         timeTakenInMs:
 *           type: integer
 *         bestStreak:
 *           type: integer
 *         incorrectAttempts:
 *           type: integer
 *         screenTimeEarned:
 *           type: number
 *
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a list of all users
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login or create user
 *     description: Logs in an existing user or creates a new one
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 * @swagger
 * /api/game-results:
 *   post:
 *     summary: Save game results
 *     description: Saves the results of a completed game
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameResult'
 *     responses:
 *       200:
 *         description: Saved game result
 *
 * @swagger
 * /api/screen-time:
 *   get:
 *     summary: Get user's screen time
 *     description: Retrieves the total screen time earned by a user
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: timezone
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Screen time data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 screenTime:
 *                   type: number
 *
 * @swagger
 * /api/daily-stats:
 *   get:
 *     summary: Get user's daily statistics
 *     description: Retrieves the count of easy and hard games played today
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: timezone
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daily statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 easy_count:
 *                   type: integer
 *                 hard_count:
 *                   type: integer
 */

export function registerRoutes(app: Express): Server {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(
    csrf({
      cookie: {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
      },
    })
  );

  // CORS configuration
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, CSRF-Token');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });

  // Provide CSRF token to frontend
  app.get('/api/csrf-token', (req, res) => {
    try {
      const token = req.csrfToken();
      res.cookie('XSRF-TOKEN', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      res.json({ csrfToken: token });
    } catch (error) {
      console.error('Error generating CSRF token:', error);
      res.status(500).json({ error: 'Failed to generate CSRF token' });
    }
  });

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

      const [result] = await db
        .insert(gameResults)
        .values({
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
        })
        .returning();

      res.json(result);
    } catch (error) {
      console.error('Error saving game result:', error);
      res.status(500).json({ error: 'Failed to save game result' });
    }
  });

  app.post('/api/user/theme', async (req, res) => {
    try {
      const { userId, themeColor } = req.body;
      await db.update(users).set({ themeColor }).where(eq(users.id, userId));
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
      const userTimezone = (req.query.timezone as string) || 'UTC';

      const result = await db.execute(sql`
        SELECT COALESCE(SUM(screen_time_earned::float), 0) as total_screen_time
        FROM game_results
        WHERE user_id = ${userId}
        AND created_at::timestamp >= TIMEZONE(${userTimezone}, date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE ${userTimezone} + INTERVAL '1 day') - INTERVAL '1 day')
        AND created_at::timestamp < TIMEZONE(${userTimezone}, date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE ${userTimezone} + INTERVAL '1 day') + INTERVAL '1 week' - INTERVAL '1 day')
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
      const userTimezone = (req.query.timezone as string) || 'UTC';

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
          hard_count: Number(stats.rows[0].hard_count || 0),
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

  // Get game question results for a specific game
  app.get('/api/game-question-results/:gameId', async (req, res) => {
    try {
      const results = await db
        .select()
        .from(gameQuestionResults)
        .where(eq(gameQuestionResults.gameId, req.params.gameId));
      res.json(results);
    } catch (error) {
      console.error('Error fetching game question results:', error);
      res.status(500).json({ error: 'Failed to fetch game question results' });
    }
  });

  // Get game question results for a specific user
  app.get('/api/game-question-results/user/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const results = await db
        .select()
        .from(gameQuestionResults)
        .where(eq(gameQuestionResults.userId, userId))
        .orderBy(gameQuestionResults.createdAt);
      res.json(results);
    } catch (error) {
      console.error('Error fetching user game question results:', error);
      res.status(500).json({ error: 'Failed to fetch user game question results' });
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

  app.post('/api/amc-game-results', async (req, res) => {
    try {
      // Calculate screen time earned
      let screenTimeEarned = req.body.correctAnswers * 0.5;
      const isPerfectScore = req.body.correctAnswers === req.body.questionsCount;
      const timeInMinutes = req.body.timeTakenInMs / (1000 * 60);

      if (isPerfectScore) {
        screenTimeEarned += 2.5; // AMC Scholar achievement
        if (timeInMinutes < 8) {
          screenTimeEarned += 2; // AMC Expert achievement
          if (timeInMinutes < 5) {
            screenTimeEarned += 2; // AMC Master achievement
          }
        }
      }

      const [result] = await db
        .insert(amcGameResults)
        .values({
          userId: req.body.userId,
          competitionType: req.body.competitionType,
          questionsCount: req.body.questionsCount,
          correctAnswers: req.body.correctAnswers,
          incorrectAnswers: req.body.incorrectAnswers,
          noAnswers: req.body.noAnswers,
          timeTakenInMs: req.body.timeTakenInMs,
          screenTimeEarned,
        })
        .returning();

      res.json(result);
    } catch (error) {
      console.error('Error saving AMC game result:', error);
      res.status(500).json({ error: 'Failed to save AMC game result' });
    }
  });

  app.post('/api/amc-game-question-results', async (req, res) => {
    try {
      const results = await db.insert(amcGameQuestionResults).values(
        req.body.questionResults.map((q: any) => ({
          gameId: req.body.gameId,
          userId: req.body.userId,
          problemId: q.problemId,
          userAnswer: q.userAnswer,
          userScore: q.userScore,
        }))
      );
      res.json(results);
    } catch (error) {
      console.error('Error saving AMC question results:', error);
      res.status(500).json({ error: 'Failed to save AMC question results' });
    }
  });

  app.get('/api/amc-screen-time', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const userTimezone = (req.query.timezone as string) || 'UTC';

      const result = await db.execute(sql`
        SELECT COALESCE(SUM(screen_time_earned::float), 0) as total_screen_time
        FROM amc_game_results
        WHERE user_id = ${userId}
        AND created_at::timestamp >= TIMEZONE(${userTimezone}, date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE ${userTimezone} + INTERVAL '1 day') - INTERVAL '1 day')
        AND created_at::timestamp < TIMEZONE(${userTimezone}, date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE ${userTimezone} + INTERVAL '1 day') + INTERVAL '1 week' - INTERVAL '1 day')
      `);

      res.json({ screenTime: Number(result.rows[0].total_screen_time) });
    } catch (error) {
      console.error('Error fetching AMC screen time:', error);
      res.status(500).json({ error: 'Failed to fetch AMC screen time' });
    }
  });

  app.get('/api/problems/amc8', async (req, res) => {
    try {
      const { problemRange = '', excludeIds = '' } = req.query;
      const excludedIdsList = (excludeIds as string).split(',').filter(Boolean);
      
      let problemRangeQuery = '';
      if (problemRange === '1-10') {
        problemRangeQuery = 'AND problem_number BETWEEN 1 AND 10';
      } else if (problemRange === '11-20') {
        problemRangeQuery = 'AND problem_number BETWEEN 11 AND 20';
      } else if (problemRange === '21-25') {
        problemRangeQuery = 'AND problem_number BETWEEN 21 AND 25';
      }

      const result = await db.execute(sql`
        SELECT *
        FROM problems
        WHERE competition_type = 'AMC 8'
        ${excludedIdsList.length > 0 
          ? sql`AND id NOT IN (${excludedIdsList.join(',')})` 
          : sql``}
        ${sql.raw(problemRangeQuery)}
        ORDER BY RANDOM()
        LIMIT 1
      `);
      
      if (!result.rows[0]) {
        return res.status(404).json({ error: 'No AMC 8 problems found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching AMC 8 problem:', error);
      res.status(500).json({ error: 'Failed to fetch problem' });
    }
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  const httpServer = createServer(app);
  return httpServer;
}
