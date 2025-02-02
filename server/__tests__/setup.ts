import { beforeAll } from '@jest/globals';
import { afterAll } from '@jest/globals';
import { db } from '../../db';

beforeAll(async () => {  // Clear test data
  await db.delete(db.game_question_results).execute();
  await db.delete(db.game_results).execute();
  await db.delete(db.users).execute();
});

afterAll(async () => {
  // Cleanup after tests
  await db.$client.disconnect();
});