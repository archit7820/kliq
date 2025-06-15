
-- Remove/replace the current select policy first (if needed).
DROP POLICY IF EXISTS "View memberships" ON public.community_memberships;

-- Allow users to see their own memberships,
-- and allow community owners to see all memberships of communities they own.
CREATE POLICY "View memberships and owner can see all requests"
  ON public.community_memberships
  FOR SELECT
  USING (
      user_id = auth.uid()
      OR community_id IN (
          SELECT id FROM public.communities WHERE created_by = auth.uid()
      )
  );
