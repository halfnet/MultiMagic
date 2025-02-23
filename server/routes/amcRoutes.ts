import type { Express } from 'express';
import { db } from '../../db';
import { amcGameResults, amcGameQuestionResults } from '../../db/schema';
import { sql } from 'drizzle-orm';

export function registerAMCRoutes(app: Express): void {
  app.post('/api/amc-game-results', async (req, res) => {
    try {
      // End tutor session if exists
      if (req.body.problemId && req.body.userId) {
        const userKey = `${req.body.userId}-${req.body.problemId}`;
        if (currentSession[userKey]) {
          await db
            .update(amcTutorSession)
            .set({ endedAt: sql`CURRENT_TIMESTAMP` })
            .where(sql`session_id = ${currentSession[userKey]}`);
          delete currentSession[userKey];
        }
      }
      const screenTimeEarned = calculateAMCScreenTime(req.body);
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

  app.get('/api/amc-games-played', async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const userTimezone = (req.query.timezone as string) || 'UTC';

      const result = await db.execute(sql`
        SELECT competition_type, COUNT(*) as games_played
        FROM amc_game_results
        WHERE user_id = ${userId}
        AND created_at::timestamp >= TIMEZONE(${userTimezone}, date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE ${userTimezone} + INTERVAL '1 day') - INTERVAL '1 day')
        AND created_at::timestamp < TIMEZONE(${userTimezone}, date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE ${userTimezone} + INTERVAL '1 day') + INTERVAL '1 week' - INTERVAL '1 day')
        AND tutor_mode = FALSE
        GROUP BY competition_type
      `);

      res.json(result.rows.reduce((acc: Record<string, number>, row: any) => {
        acc[row.competition_type] = Number(row.games_played);
        return acc;
      }, {}));
    } catch (error) {
      console.error('Error fetching AMC games played:', error);
      res.status(500).json({ error: 'Failed to fetch AMC games played' });
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

  app.get('/api/amc_problems', async (req, res) => {
    try {
      const { competitionType = '', problemRange = '', excludeIds = '', userId = '' } = req.query;

      let compType = '';
      let amc_lite = false;
      if (competitionType === 'AMC 8 Lite') {
        amc_lite = true;
        compType = 'AMC 8';
      } else {
        compType = competitionType.toString();
      }
      const compTypeQuery = "WHERE competition_type = '" + compType + "'";
      const pastProbQuery = "AND id NOT IN (SELECT DISTINCT id FROM amc_game_question_results WHERE user_id = " + userId + " AND user_score = 1)";

      let problemRangeQuery = '';
      if (amc_lite) {
        problemRangeQuery = 'AND problem_number BETWEEN 1 AND 12';
      } else {
        if (problemRange === '1-10') {
          problemRangeQuery = 'AND problem_number BETWEEN 1 AND 10';
        } else if (problemRange === '11-20') {
          problemRangeQuery = 'AND problem_number BETWEEN 11 AND 20';
        } else if (problemRange === '21-25') {
          problemRangeQuery = 'AND problem_number BETWEEN 21 AND 25';
        } else if (problemRange.startsWith('fixed')) {
          const [_, compType, year, problemNum] = problemRange.split('-');
          problemRangeQuery = `AND problem_number = ${problemNum} AND year = ${year}`;
        }
      }

      let idNotInQuery = '';
      if (problemRange !== 'fixed') {
        idNotInQuery = 'AND id NOT IN (' + excludeIds + ')';
      }

      const result = await db.execute(sql`
        SELECT *
        FROM problems
        ${sql.raw(compTypeQuery)}
        ${sql.raw(pastProbQuery)}
        ${sql.raw(problemRangeQuery)}
        ${excludeIds ? sql.raw(idNotInQuery) : sql``}
        ORDER BY RANDOM()
        LIMIT 1
      `);

      if (!result.rows[0]) {
        return res.status(404).json({ error: 'No ' + competitionType + 'problems found' });
      }

      console.info('Loaded AMC problem:', {
        year: result.rows[0].year,
        competitionType: result.rows[0].competition_type,
        problemNumber: result.rows[0].problem_number,
      });
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching problem:', error);
      res.status(500).json({ error: 'Failed to fetch problem' });
    }
  });
}

export function calculateAMCScreenTime(body: any): number {
  let screenTimeEarned = body.correctAnswers * 0.5;
  const isPerfectScore = body.correctAnswers === body.questionsCount;
  const timeInMinutes = body.timeTakenInMs / (1000 * 60);

  if (isPerfectScore) {
    screenTimeEarned += 2.5;
    if (!body.competitionType.includes('Lite')) {
      if (timeInMinutes < 8) {
        screenTimeEarned += 2;
        if (timeInMinutes < 5) {
          screenTimeEarned += 2;
        }
      }
    }
  }
  return screenTimeEarned;
}