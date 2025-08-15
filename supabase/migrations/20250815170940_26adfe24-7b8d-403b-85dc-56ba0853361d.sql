-- Fix community visibility security vulnerability
-- Drop all existing policies to start clean
DROP POLICY IF EXISTS "View all communities" ON public.communities;
DROP POLICY IF EXISTS "Authenticated users can view public communities" ON public.communities;
DROP POLICY IF EXISTS "Community members can view their communities" ON public.communities;
DROP POLICY IF EXISTS "Community owners can view their communities" ON public.communities;

-- Create secure policies for community access
-- 1. Allow authenticated users to view public communities only
CREATE POLICY "Public communities viewable by authenticated users" 
ON public.communities 
FOR SELECT 
TO authenticated
USING (privacy_type = 'public');

-- 2. Allow community members to view their communities (full access including private data)
CREATE POLICY "Members can view their communities" 
ON public.communities 
FOR SELECT 
TO authenticated
USING (
  id IN (
    SELECT community_id 
    FROM public.community_memberships 
    WHERE user_id = auth.uid() 
    AND status = 'approved'
  )
);

-- 3. Allow community owners to view their own communities (full access)
CREATE POLICY "Owners can view their communities" 
ON public.communities 
FOR SELECT 
TO authenticated
USING (created_by = auth.uid());

-- Create a function for safe community discovery that filters sensitive data
CREATE OR REPLACE FUNCTION public.get_discoverable_communities(
  p_scope text DEFAULT NULL,
  p_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  category text,
  scope text,
  privacy_type text,
  cover_image_url text,
  created_by uuid,
  member_count bigint,
  is_joined boolean
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  WITH community_members AS (
    SELECT 
      community_id,
      COUNT(*) as member_count
    FROM public.community_memberships 
    WHERE status = 'approved'
    GROUP BY community_id
  )
  SELECT 
    c.id,
    c.name,
    c.description,
    c.category,
    c.scope::text,
    c.privacy_type,
    c.cover_image_url,
    c.created_by,
    COALESCE(cm.member_count, 0) as member_count,
    EXISTS(
      SELECT 1 FROM public.community_memberships 
      WHERE community_id = c.id 
      AND user_id = auth.uid() 
      AND status = 'approved'
    ) as is_joined
  FROM public.communities c
  LEFT JOIN community_members cm ON c.id = cm.community_id
  WHERE 
    -- Only show public communities or communities the user is a member of
    (c.privacy_type = 'public' OR c.id IN (
      SELECT community_id 
      FROM public.community_memberships 
      WHERE user_id = auth.uid() 
      AND status = 'approved'
    ))
    AND (p_scope IS NULL OR c.scope::text = p_scope)
    AND (p_category IS NULL OR c.category = p_category)
  ORDER BY cm.member_count DESC NULLS LAST;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_discoverable_communities TO authenticated;