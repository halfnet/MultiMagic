import type { Express } from 'express';
import { db } from '../../db';
import { gameResults, gameQuestionResults } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';

/**
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
 */

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
 */

/**
 * @swagger
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
 */

/**
 * @swagger
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
 */

/**
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
 */

/**
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

/**
 * @swagger
 * components:
 *   schemas:
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
 */

export function registerGameRoutes(app: Express): void {
  app.post('/api/game-results', async (req, res) => {
    try {
      const screenTime = calculateGameScreenTime(req.body);
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

  app.get('/api/screen-time', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const userTimezone = (req.query.timezone as string) || 'UTC';

      const result = await db.execute(sql`
        SELECT 
          COALESCE(SUM(CASE WHEN difficulty = 'easy' THEN screen_time_earned::float ELSE 0 END), 0) as easy_time,
          COALESCE(SUM(CASE WHEN difficulty = 'hard' THEN screen_time_earned::float ELSE 0 END), 0) as hard_time
        FROM game_results
        WHERE user_id = ${userId}
        AND created_at::timestamp >= TIMEZONE(${userTimezone}, date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE ${userTimezone} + INTERVAL '1 day') - INTERVAL '1 day')
        AND created_at::timestamp < TIMEZONE(${userTimezone}, date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE ${userTimezone} + INTERVAL '1 day') + INTERVAL '1 week' - INTERVAL '1 day')
      `);

      const easyTime = Number(result.rows[0].easy_time);
      const hardTime = Number(result.rows[0].hard_time);

      res.json({ easyTime, hardTime });
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
}

function calculateGameScreenTime(body: any): number {
  let screenTime = 0;
  const hasSpeedMaster = body.timeTakenInMs < 60000;
  const hasPerfectScore = body.incorrectAttempts === 0;
  const hasAllAchievements = hasSpeedMaster && hasPerfectScore;

  if (body.mode === 'regular') {
    if (body.difficulty === 'easy') {
      screenTime = hasAllAchievements ? 1.0 : 0.5;
    } else if (body.difficulty === 'hard') {
      screenTime = hasAllAchievements ? 6.0 : 2.0;
    }
  }
  return screenTime;
}