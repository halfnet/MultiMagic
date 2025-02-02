import { beforeAll } from '@jest/globals';
import { afterAll } from '@jest/globals';
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../../db/schema";

const testDb = drizzle({
  connection: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
  schema,
});

beforeAll(async () => {  // Clear test data only if using test database
  if (!process.env.TEST_DATABASE_URL) {
    console.warn('Warning: Tests are running against production database');
    return;
  }
  await testDb.delete(schema.game_question_results).execute();
  await testDb.delete(schema.game_results).execute();
  await testDb.delete(schema.users).execute();
});

afterAll(async () => {
  // Cleanup after tests
  await db.$client.disconnect();
});