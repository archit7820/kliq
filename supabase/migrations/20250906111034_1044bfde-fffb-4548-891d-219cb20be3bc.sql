-- Add daily completion tracking to challenge_participants
ALTER TABLE challenge_participants 
ADD COLUMN daily_completions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN last_completed_date date DEFAULT NULL;

-- Create index for better performance on date queries
CREATE INDEX idx_challenge_participants_last_completed_date 
ON challenge_participants(last_completed_date);