
-- Drop the existing SELECT policy on the activities table
DROP POLICY "Users can view their own activities" ON public.activities;

-- Create a new policy that allows users to see their own and their friends' activities
CREATE POLICY "Users can view their own and friends' activities"
  ON public.activities FOR SELECT
  USING (
    -- User can see their own activities
    auth.uid() = user_id
    OR
    -- User can see their friends' activities
    EXISTS (
      SELECT 1
      FROM public.friends
      WHERE
        (friends.user1_id = auth.uid() AND friends.user2_id = activities.user_id)
        OR
        (friends.user2_id = auth.uid() AND friends.user1_id = activities.user_id)
    )
  );
