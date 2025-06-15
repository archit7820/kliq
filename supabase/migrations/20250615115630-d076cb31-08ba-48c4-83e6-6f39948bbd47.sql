
-- Allow community owners to update (approve/reject) ANY membership for their communities
CREATE POLICY "Community owner can update membership status"
  ON public.community_memberships
  FOR UPDATE
  USING (
    community_id IN (
      SELECT id FROM public.communities WHERE created_by = auth.uid()
    )
  );

-- (Optional) Allow users to update their own row (e.g. if you want "leave"/"re-apply" logic)
CREATE POLICY "User can update own membership"
  ON public.community_memberships
  FOR UPDATE
  USING (
    user_id = auth.uid()
  );
