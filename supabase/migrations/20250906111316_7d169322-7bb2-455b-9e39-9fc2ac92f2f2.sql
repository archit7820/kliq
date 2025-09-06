-- Update RLS policy to allow users to update their own challenge participation with daily completions
DROP POLICY IF EXISTS "User can update their own participation" ON challenge_participants;

CREATE POLICY "User can update their own participation" 
ON challenge_participants
FOR UPDATE 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());