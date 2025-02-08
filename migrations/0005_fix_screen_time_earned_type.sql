
-- First, create a temporary column with the correct type
ALTER TABLE game_results ADD COLUMN screen_time_earned_float FLOAT;

-- Copy data from text column to float column, handling any invalid conversions
UPDATE game_results SET screen_time_earned_float = CASE 
    WHEN screen_time_earned IS NULL THEN NULL 
    ELSE screen_time_earned::FLOAT 
END;

-- Drop the old column
ALTER TABLE game_results DROP COLUMN screen_time_earned;

-- Rename the new column to the original name
ALTER TABLE game_results RENAME COLUMN screen_time_earned_float TO screen_time_earned;
