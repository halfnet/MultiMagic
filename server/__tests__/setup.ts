
import { db } from '../../db';

beforeAll(async () => {
  // Clear test data
  await db.delete('game_question_results').execute();
  await db.delete('game_results').execute();
  await db.delete('users').execute();
});

afterAll(async () => {
  // Cleanup after tests
  await db.$disconnect();
});
