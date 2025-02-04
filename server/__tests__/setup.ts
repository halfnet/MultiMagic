import { beforeAll } from '@jest/globals';
import { afterAll } from '@jest/globals';
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../../db/schema";
import { Pool } from 'pg';
import ws from "ws";

if (!process.env.TEST_DATABASE_URL) {
  console.error('Missing TEST_DATABASE_URL environment variable');
  throw new Error(
    "TEST_DATABASE_URL environment variable is not set. Please ensure the database is properly provisioned.",
  );
}

let dbInstance;
try {
  console.log('Initializing database connection...');
  dbInstance = drizzle({
    connection: process.env.TEST_DATABASE_URL,
    schema,
    ws: ws,
  });
  console.log('Database connection initialized successfully');
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  throw error;
}

export const testDb = dbInstance;


beforeAll(async () => {  // Clear test data only if using test database
  if (!process.env.TEST_DATABASE_URL) {
    console.warn('Warning: Tests are running against production database');
    return;
  }
  await testDb.delete(schema.gameQuestionResults).execute();
  await testDb.delete(schema.gameResults).execute();
  await testDb.delete(schema.users).execute();
});

afterAll(async () => {
  // Cleanup after tests
  const pool = new Pool({
    connectionString: process.env.TEST_DATABASE_URL,
  });
  // Access the underlying client and close the connection when done
  await pool.end();
});