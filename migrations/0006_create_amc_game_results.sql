
CREATE TABLE IF NOT EXISTS amc_game_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  competition_type TEXT NOT NULL,
  questions_count INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  incorrect_answers INTEGER NOT NULL,
  no_answers INTEGER NOT NULL,
  time_taken_in_ms INTEGER NOT NULL,
  screen_time_earned FLOAT DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);
