import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  lastLoginAt: text("last_login_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  themeColor: text("theme_color").default('#7c3aed'),
});

export const gameResults = pgTable("game_results", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").unique().notNull(),
  userId: integer("user_id").references(() => users.id),
  difficulty: text("difficulty").notNull(),
  mode: text("mode").notNull(),
  practiceDigit: integer("practice_digit"),
  questionsCount: integer("questions_count").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  timeTakenInMs: integer("time_taken_in_ms").notNull(),
  bestStreak: integer("best_streak").notNull(),
  incorrectAttempts: integer("incorrect_attempts").notNull(),
  screenTimeEarned: text("screen_time_earned"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const gameQuestionResults = pgTable("game_question_results", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").references(() => gameResults.gameId).notNull(),
  userId: integer("user_id").references(() => users.id),
  questionNumber: integer("question_number").notNull(),
  num1: integer("num1").notNull(),
  num2: integer("num2").notNull(),
  attempts: integer("attempts").notNull(),
  timeToSolveMs: integer("time_to_solve_ms").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Schema validation and type definitions
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertGameResultSchema = createInsertSchema(gameResults);
export const selectGameResultSchema = createSelectSchema(gameResults);
export const insertGameQuestionResultSchema = createInsertSchema(gameQuestionResults);
export const selectGameQuestionResultSchema = createSelectSchema(gameQuestionResults);

// Type exports
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertGameQuestionResult = typeof gameQuestionResults.$inferInsert;
export type SelectGameQuestionResult = typeof gameQuestionResults.$inferSelect;
export type InsertGameResult = typeof gameResults.$inferInsert;
export type SelectGameResult = typeof gameResults.$inferSelect;