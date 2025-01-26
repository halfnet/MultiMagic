import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const gameResults = pgTable("game_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  difficulty: text("difficulty").notNull(),
  mode: text("mode").notNull(),
  practiceDigit: integer("practice_digit"),
  questionsCount: integer("questions_count").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  timeTaken: integer("time_taken").notNull(),
  bestStreak: integer("best_streak").notNull(),
  incorrectAttempts: integer("incorrect_attempts").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertGameResultSchema = createInsertSchema(gameResults);
export const selectGameResultSchema = createSelectSchema(gameResults);

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertGameResult = typeof gameResults.$inferInsert;
export type SelectGameResult = typeof gameResults.$inferSelect;
