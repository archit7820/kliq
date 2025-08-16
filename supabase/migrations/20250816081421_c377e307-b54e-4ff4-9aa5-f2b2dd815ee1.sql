
-- First, let's drop ALL existing policies on both tables to start fresh
DROP POLICY IF EXISTS "Create communities" ON public.communities;
DROP POLICY IF EXISTS "Delete own community" ON public.communities;
DROP POLICY IF EXISTS "Edit own community" ON public.communities;
DROP POLICY IF EXISTS "Enable delete access for community creators" ON public.communities;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.communities;
DROP POLICY IF EXISTS "Enable read access for all communities" ON public.communities;
DROP POLICY IF EXISTS "Enable update access for community creators" ON public.communities;
DROP POLICY IF EXISTS "Members can view their communities" ON public.communities;
DROP POLICY IF EXISTS "Owners can view their communities" ON public.communities;
DROP POLICY IF EXISTS "Public communities viewable by authenticated users" ON public.communities;

DROP POLICY IF EXISTS "Community owner can update membership status" ON public.community_memberships;
DROP POLICY IF EXISTS "Enable delete access for users to their own memberships" ON public.community_memberships;
DROP POLICY IF EXISTS "Enable insert access for users to create memberships" ON public.community_memberships;
DROP POLICY IF EXISTS "Enable read access for users to their own memberships" ON public.community_memberships;
DROP POLICY IF EXISTS "Enable update access for users to their own memberships" ON public.community_memberships;
DROP POLICY IF EXISTS "Join community" ON public.community_memberships;
DROP POLICY IF EXISTS "Leave community" ON public.community_memberships;
DROP POLICY IF EXISTS "User can update own membership" ON public.community_memberships;
DROP POLICY IF EXISTS "View memberships and owner can see all requests" ON public.community_memberships;

-- Create a security definer function to check community ownership
CREATE OR REPLACE FUNCTION public.is_community_owner(community_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.communities 
    WHERE id = community_id AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create simple, non-recursive policies for communities
CREATE POLICY "communities_select_policy" ON public.communities
FOR SELECT USING (true);

CREATE POLICY "communities_insert_policy" ON public.communities
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "communities_update_policy" ON public.communities
FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "communities_delete_policy" ON public.communities
FOR DELETE USING (created_by = auth.uid());

-- Create simple policies for community_memberships
CREATE POLICY "memberships_select_policy" ON public.community_memberships
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.is_community_owner(community_id)
);

CREATE POLICY "memberships_insert_policy" ON public.community_memberships
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "memberships_update_policy" ON public.community_memberships
FOR UPDATE USING (
  user_id = auth.uid() OR 
  public.is_community_owner(community_id)
);

CREATE POLICY "memberships_delete_policy" ON public.community_memberships
FOR DELETE USING (user_id = auth.uid());
