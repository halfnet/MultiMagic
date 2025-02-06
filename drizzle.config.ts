import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please ensure the database is properly provisioned.'
  );
}

export default defineConfig({
  out: './migrations',
  schema: './db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
