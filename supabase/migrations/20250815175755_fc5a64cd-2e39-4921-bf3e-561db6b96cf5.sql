
-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view their own community memberships" ON public.community_memberships;
DROP POLICY IF EXISTS "Users can create their own community memberships" ON public.community_memberships;
DROP POLICY IF EXISTS "Users can update their own community memberships" ON public.community_memberships;
DROP POLICY IF EXISTS "Users can delete their own community memberships" ON public.community_memberships;

-- Drop existing policies that might be causing recursion on communities table
DROP POLICY IF EXISTS "Users can view communities they are members of" ON public.communities;
DROP POLICY IF EXISTS "Users can view public communities" ON public.communities;

-- Create simple, non-recursive policies for community_memberships
CREATE POLICY "Enable read access for users to their own memberships" 
ON public.community_memberships FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users to create memberships" 
ON public.community_memberships FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users to their own memberships" 
ON public.community_memberships FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users to their own memberships" 
ON public.community_memberships FOR DELETE 
USING (auth.uid() = user_id);

-- Create simple policies for communities table
CREATE POLICY "Enable read access for all communities" 
ON public.communities FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for authenticated users" 
ON public.communities FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable update access for community creators" 
ON public.communities FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Enable delete access for community creators" 
ON public.communities FOR DELETE 
USING (auth.uid() = created_by);
