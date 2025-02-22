import { Router } from 'express';
import { db } from '../../../db';
import { amcGameResults, amcGameQuestionResults } from '../../../db/schema';
import { sql } from 'drizzle-orm';
import fetch from 'node-fetch';

const router = Router();

router.get('/amc-games-played', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    const timezone = (req.query.timezone as string) || 'UTC';
    const excludeTutorMode = req.query.excludeTutorMode === 'true';

    let query = sql`
      SELECT competition_type, COUNT(*) as count
      FROM amc_game_results 
      WHERE user_id = ${userId}
      AND created_at::timestamp >= TIMEZONE(${timezone}, date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE ${timezone} + INTERVAL '1 day') - INTERVAL '1 day')
      AND created_at::timestamp < TIMEZONE(${timezone}, date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE ${timezone} + INTERVAL '1 day') + INTERVAL '1 week' - INTERVAL '1 day')
    `;

    if (excludeTutorMode) {
      query = sql`${query} AND (tutor_mode = false OR tutor_mode IS NULL)`;
    }

    query = sql`${query} 
      GROUP BY competition_type
    `;

    const result = await db.execute(query);
    const gamesByType = Object.fromEntries(
      result.rows.map(row => [
        row.competition_type,
        parseInt(row.count)
      ])
    );

    res.json(gamesByType);
  } catch (error) {
    console.error('Error fetching AMC games played:', error);
    res.status(500).json({ error: 'Failed to fetch AMC games played' });
  }
});

router.post('/amc-game-results', async (req, res) => {
  try {
    let screenTimeEarned = req.body.correctAnswers * 0.5;
    const isPerfectScore = req.body.correctAnswers === req.body.questionsCount;
    const timeInMinutes = req.body.timeTakenInMs / (1000 * 60);

    if (isPerfectScore) {
      screenTimeEarned += 2.5;
      if (!req.body.competitionType.includes('Lite')) {
        if (timeInMinutes < 8) {
          screenTimeEarned += 2;
          if (timeInMinutes < 5) {
            screenTimeEarned += 2;
          }
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
        tutorMode: req.body.tutorMode || false,
      })
      .returning();

    res.json(result);
  } catch (error) {
    console.error('Error saving AMC game result:', error);
    res.status(500).json({ error: 'Failed to save AMC game result' });
  }
});

router.get('/amc-screen-time', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    const userTimezone = (req.query.timezone as string) || 'UTC';

    const result = await db.execute(sql`
      SELECT COALESCE(SUM(screen_time_earned), 0) as screen_time
      FROM amc_game_results 
      WHERE user_id = ${userId}
      AND created_at::timestamp >= TIMEZONE(${userTimezone}, date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE ${userTimezone} + INTERVAL '1 day') - INTERVAL '1 day')
      AND created_at::timestamp < TIMEZONE(${userTimezone}, date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE ${userTimezone} + INTERVAL '1 day') + INTERVAL '1 week' - INTERVAL '1 day')
    `);

    const screenTime = Number(result.rows[0].screen_time);
    res.json({ screenTime });
  } catch (error) {
    console.error('Error fetching AMC screen time:', error);
    res.status(500).json({ error: 'Failed to fetch AMC screen time' });
  }
});

router.get('/amc_problems', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string);
    const competitionType = req.query.competitionType as string;
    const problemRange = req.query.problemRange as string;
    const excludeIds = (req.query.excludeIds as string || '').split(',').filter(Boolean);

    if (!competitionType) {
      res.status(400).json({ error: 'Competition type is required' });
      return;
    }

    let query;
    
    if (problemRange.startsWith('fixed-')) {
      // Extract the actual problem identifier after 'fixed-'
      const [_, compType, year, number] = problemRange.match(/fixed-(AMC \d+)-(\d+)-(\d+)/) || [];
      query = sql`
        SELECT * FROM problems 
        WHERE competition_type = ${compType}
        AND year = ${parseInt(year)}
        AND problem_number = ${parseInt(number)}
      `;
    } else {
      query = sql`
        SELECT * FROM problems 
        WHERE competition_type = ${competitionType}
      `;

      if (excludeIds.length > 0) {
        query = sql`${query} AND id NOT IN (${sql.join(excludeIds, sql`, `)})`;
      }

      query = sql`${query} ORDER BY RANDOM() LIMIT 1`;
    }

    const result = await db.execute(query);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No problems found for this competition type' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching AMC problem:', error);
    res.status(500).json({ 
      error: 'Failed to fetch AMC problem',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/tutor-chat', async (req, res) => {
  try {
    const { messages, problemId, currentQuestion } = req.body;
    
    // For now, return a simple response
    // You can enhance this with actual AI/LLM integration later
    const response = "Let me help you with this AMC problem. What specific part would you like me to explain?";
    
    res.json({ response });
  } catch (error) {
    console.error('Error in tutor chat:', error);
    res.status(500).json({ error: 'Failed to process tutor chat request' });
  }
});

export default router;