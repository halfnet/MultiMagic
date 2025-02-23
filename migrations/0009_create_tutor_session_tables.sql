
-- Create amc_tutor_session table
CREATE TABLE amc_tutor_session (
  session_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  problem_id INTEGER REFERENCES problems(id),
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

-- Create amc_tutor_session_interactions table
CREATE TABLE amc_tutor_session_interactions (
  session_interaction_id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES amc_tutor_session(session_id),
  user_question TEXT NOT NULL,
  tutor_response TEXT NOT NULL,
  question_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  response_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
