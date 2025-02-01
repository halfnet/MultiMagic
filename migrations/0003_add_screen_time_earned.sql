
ALTER TABLE game_results DROP COLUMN IF EXISTS screen_time_earned;
ALTER TABLE game_results ADD COLUMN screen_time_earned FLOAT;
