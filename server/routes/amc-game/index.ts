
import { Router } from 'express';
import { db } from '../../../db';
import { amcGameResults, amcGameQuestionResults } from '../../../db/schema';
import { sql } from 'drizzle-orm';
import fetch from 'node-fetch';

const router = Router();

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

// Add other AMC game related routes here...
export default router;
