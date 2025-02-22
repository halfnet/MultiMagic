
import { Router } from 'express';
import { db } from '../../../db';
import { gameResults, gameQuestionResults } from '../../../db/schema';
import { sql } from 'drizzle-orm';

const router = Router();

router.post('/game-results', async (req, res) => {
  try {
    let screenTime = 0;
    const hasSpeedMaster = req.body.timeTakenInMs < 60000;
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

router.post('/game-question-results', async (req, res) => {
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

router.get('/screen-time', async (req, res) => {
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

// Add other math game related routes (daily-stats, analytics) here...
export default router;
