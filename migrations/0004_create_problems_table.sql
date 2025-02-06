
CREATE TABLE IF NOT EXISTS problems (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  competition_type VARCHAR(20) NOT NULL,
  problem_number INTEGER NOT NULL,
  question_html TEXT,
  solution_html TEXT,
  answer VARCHAR(10),
  CONSTRAINT unique_problem UNIQUE (year, competition_type, problem_number)
);
