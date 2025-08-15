-- Fix profile visibility security vulnerability
-- Remove the overly permissive policy that exposes all profile data to authenticated users
DROP POLICY IF EXISTS "Authenticated users can view basic public profiles." ON public.profiles;

-- Create a more secure policy for friends and self
CREATE POLICY "Users can view own and friends profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- User can see their own profile
  auth.uid() = id 
  OR 
  -- User can see friends' profiles
  id IN (
    SELECT CASE 
      WHEN user1_id = auth.uid() THEN user2_id
      WHEN user2_id = auth.uid() THEN user1_id
    END
    FROM public.friends 
    WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- Create a function for leaderboard data that only exposes safe public fields
CREATE OR REPLACE FUNCTION public.get_leaderboard_profiles(limit_count integer DEFAULT 10)
RETURNS TABLE (
  id uuid,
  username text,
  avatar_url text,
  kelp_points numeric
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT p.id, p.username, p.avatar_url, p.kelp_points
  FROM public.profiles p
  ORDER BY p.kelp_points DESC NULLS LAST
  LIMIT limit_count;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_leaderboard_profiles TO authenticated;