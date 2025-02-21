import { pgTable, text, serial, integer, uniqueIndex, decimal } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').unique().notNull(),
  lastLoginAt: text('last_login_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  themeColor: text('theme_color').default('#7c3aed'),
});

export const gameResults = pgTable('game_results', {
  id: serial('id').primaryKey(),
  gameId: text('game_id').unique().notNull(),
  userId: integer('user_id').references(() => users.id),
  difficulty: text('difficulty').notNull(),
  mode: text('mode').notNull(),
  practiceDigit: integer('practice_digit'),
  questionsCount: integer('questions_count').notNull(),
  correctAnswers: integer('correct_answers').notNull(),
  timeTakenInMs: integer('time_taken_in_ms').notNull(),
  bestStreak: integer('best_streak').notNull(),
  incorrectAttempts: integer('incorrect_attempts').notNull(),
  screenTimeEarned: decimal('screen_time_earned', { precision: 10, scale: 2 }),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const gameQuestionResults = pgTable('game_question_results', {
  id: serial('id').primaryKey(),
  gameId: text('game_id')
    .references(() => gameResults.gameId)
    .notNull(),
  userId: integer('user_id').references(() => users.id),
  questionNumber: integer('question_number').notNull(),
  num1: integer('num1').notNull(),
  num2: integer('num2').notNull(),
  attempts: integer('attempts').notNull(),
  timeToSolveMs: integer('time_to_solve_ms').notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
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

export const problems = pgTable('problems', {
  id: serial('id').primaryKey(),
  year: integer('year').notNull(),
  competitionType: text('competition_type').notNull(),
  problemNumber: integer('problem_number').notNull(),
  questionHtml: text('question_html'),
  solutionHtml: text('solution_html'),
  answer: text('answer'),
}, (table) => {
  return {
    uniqueProblem: uniqueIndex('unique_problem').on(
      table.year,
      table.competitionType,
      table.problemNumber
    ),
  }
});

export const insertProblemSchema = createInsertSchema(problems);
export const selectProblemSchema = createSelectSchema(problems);
export type InsertProblem = typeof problems.$inferInsert;
export type SelectProblem = typeof problems.$inferSelect;

export const amcGameResults = pgTable('amc_game_results', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  competitionType: text('competition_type').notNull(),
  questionsCount: integer('questions_count').notNull(),
  correctAnswers: integer('correct_answers').notNull(),
  incorrectAnswers: integer('incorrect_answers').notNull(),
  noAnswers: integer('no_answers').notNull(),
  timeTakenInMs: integer('time_taken_in_ms').notNull(),
  screenTimeEarned: decimal('screen_time_earned', { precision: 10, scale: 2 }).default('0'),
  tutorMode: boolean('tutor_mode').default(false),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertAmcGameResultSchema = createInsertSchema(amcGameResults);
export const selectAmcGameResultSchema = createSelectSchema(amcGameResults);
export type InsertAmcGameResult = typeof amcGameResults.$inferInsert;
export type SelectAmcGameResult = typeof amcGameResults.$inferSelect;

export const amcGameQuestionResults = pgTable('amc_game_question_results', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id').references(() => amcGameResults.id),
  userId: integer('user_id').references(() => users.id),
  problemId: integer('problem_id').references(() => problems.id),
  userAnswer: text('user_answer'),
  userScore: integer('user_score').notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const insertAmcGameQuestionResultSchema = createInsertSchema(amcGameQuestionResults);
export const selectAmcGameQuestionResultSchema = createSelectSchema(amcGameQuestionResults);
export type InsertAmcGameQuestionResult = typeof amcGameQuestionResults.$inferInsert;
export type SelectAmcGameQuestionResult = typeof amcGameQuestionResults.$inferSelect;
