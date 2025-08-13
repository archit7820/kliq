-- Secure profiles access and add helper RPCs + protective trigger

-- 1) Remove broad profiles SELECT policy that exposes all data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Authenticated users can view basic public profiles.'
  ) THEN
    DROP POLICY "Authenticated users can view basic public profiles." ON public.profiles;
  END IF;
END$$;

-- 2) Allow users to view their friends' profiles (and their own already covered)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view friends\' profiles'
  ) THEN
    CREATE POLICY "Users can view friends' profiles"
    ON public.profiles
    FOR SELECT
    USING (
      -- Own profile or friend relationship
      auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.friends f
        WHERE (
          (f.user1_id = auth.uid() AND f.user2_id = profiles.id)
          OR
          (f.user2_id = auth.uid() AND f.user1_id = profiles.id)
        )
      )
    );
  END IF;
END$$;

-- 3) Protective trigger to prevent client-side escalation of server-controlled fields
CREATE OR REPLACE FUNCTION public.prevent_client_profile_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role text := COALESCE((current_setting('request.jwt.claims', true)::jsonb ->> 'role'), '');
BEGIN
  -- Allow service role updates (backend jobs) to proceed
  IF role = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Block changes to server-controlled fields from clients
  IF NEW.kelp_points IS DISTINCT FROM OLD.kelp_points
    OR NEW.is_og_user IS DISTINCT FROM OLD.is_og_user
    OR NEW.streak_count IS DISTINCT FROM OLD.streak_count
    OR NEW.streak_last_logged IS DISTINCT FROM OLD.streak_last_logged
    OR NEW.referral_code IS DISTINCT FROM OLD.referral_code
    OR NEW.invited_by_user_id IS DISTINCT FROM OLD.invited_by_user_id
    OR NEW.invited_by_code IS DISTINCT FROM OLD.invited_by_code THEN
    RAISE EXCEPTION 'Not allowed to modify protected profile fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_client_profile_escalation();

-- 4) RPC: public search across limited profile fields (for discovery)
CREATE OR REPLACE FUNCTION public.search_public_profiles(q text)
RETURNS TABLE(id uuid, username text, full_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.full_name, p.avatar_url
  FROM public.profiles p
  WHERE p.username ILIKE ('%' || q || '%')
  ORDER BY p.username NULLS LAST
  LIMIT 50;
$$;

-- 5) RPC: fetch limited public profiles by ids (for invites/requests)
CREATE OR REPLACE FUNCTION public.get_public_profiles(ids uuid[])
RETURNS TABLE(id uuid, username text, full_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.full_name, p.avatar_url
  FROM public.profiles p
  WHERE p.id = ANY(ids)
  LIMIT 200;
$$;

-- 6) RPC: leaderboard with limited public fields
CREATE OR REPLACE FUNCTION public.get_leaderboard(lim integer DEFAULT 10)
RETURNS TABLE(id uuid, username text, avatar_url text, kelp_points numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.avatar_url, p.kelp_points
  FROM public.profiles p
  ORDER BY p.kelp_points DESC NULLS LAST
  LIMIT COALESCE(lim, 10);
$$;

-- Note: SECURITY DEFINER functions run with the function owner's rights and bypass RLS for the underlying table.
-- Ensure only authenticated users can call these RPCs by restricting PostgREST.
GRANT EXECUTE ON FUNCTION public.search_public_profiles(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(integer) TO authenticated;