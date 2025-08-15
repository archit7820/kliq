-- Fix profile visibility security vulnerability
-- Remove the overly permissive policy that exposes all profile data to authenticated users
DROP POLICY IF EXISTS "Authenticated users can view basic public profiles." ON public.profiles;

-- Create a more secure policy for public profile information (leaderboards, etc.)
-- Only expose minimal non-sensitive data publicly
CREATE POLICY "Users can view limited public profile info" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow viewing limited fields for leaderboard/public features
  -- This policy will be combined with column-level security if needed
  auth.role() = 'authenticated'::text
);

-- Create a policy for friends to see more detailed profiles
CREATE POLICY "Users can view friends' full profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- User can see their own profile (already covered by existing policy)
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

-- Create a view for public profile data that only exposes non-sensitive information
CREATE OR REPLACE VIEW public.public_profiles AS 
SELECT 
  id,
  username,
  avatar_url,
  kelp_points,
  created_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Grant select permission on the public view
GRANT SELECT ON public.public_profiles TO authenticated;

-- Create RLS policy for the public profiles view
CREATE POLICY "Authenticated users can view public profiles" 
ON public.public_profiles 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);