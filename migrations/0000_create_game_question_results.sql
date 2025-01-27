
CREATE TABLE IF NOT EXISTS game_question_results (
  id SERIAL PRIMARY KEY,
  game_id TEXT REFERENCES game_results(game_id),
  user_id INTEGER REFERENCES users(id),
  question_number INTEGER NOT NULL,
  num1 INTEGER NOT NULL,
  num2 INTEGER NOT NULL,
  attempts INTEGER NOT NULL,
  time_to_solve_ms INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);
