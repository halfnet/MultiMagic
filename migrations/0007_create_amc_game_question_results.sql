
CREATE TABLE IF NOT EXISTS amc_game_question_results (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES amc_game_results(id),
  user_id INTEGER REFERENCES users(id),
  problem_id INTEGER REFERENCES problems(id),
  user_answer TEXT,
  user_score INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);
