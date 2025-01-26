import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";

// Log all available environment variables for debugging (excluding sensitive values)
console.log('Checking database environment variables...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('PGHOST exists:', !!process.env.PGHOST);
console.log('PGPORT exists:', !!process.env.PGPORT);
console.log('PGDATABASE exists:', !!process.env.PGDATABASE);
console.log('PGUSER exists:', !!process.env.PGUSER);

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable');
  throw new Error(
    "DATABASE_URL environment variable is not set. Please ensure the database is properly provisioned.",
  );
}

let dbInstance;
try {
  console.log('Initializing database connection...');
  dbInstance = drizzle({
    connection: process.env.DATABASE_URL,
    schema,
    ws: ws,
  });
  console.log('Database connection initialized successfully');
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  throw error;
}

export const db = dbInstance;