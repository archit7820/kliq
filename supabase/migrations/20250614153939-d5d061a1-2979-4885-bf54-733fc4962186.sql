
-- 1. Create a trigger function to mark the invite as used and reward inviter when a new user sets an invite_code
CREATE OR REPLACE FUNCTION public.handle_invite_referral()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark the invite as consumed if it exists and wasn't yet
  IF NEW.invite_code IS NOT NULL THEN
    UPDATE public.invites
      SET consumed_by = NEW.id,
          consumed_at = NOW(),
          usage_count = usage_count + 1,
          is_active = CASE WHEN usage_limit > usage_count + 1 THEN TRUE ELSE FALSE END
      WHERE code = NEW.invite_code AND is_active = TRUE;
      
    -- Award kelp points to the inviter if any
    UPDATE public.profiles
      SET kelp_points = COALESCE(kelp_points, 0) + 50
      WHERE id = (SELECT created_by FROM public.invites WHERE code = NEW.invite_code);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger when profiles table is updated and invite_code is set for first time
DROP TRIGGER IF EXISTS after_profile_invite ON public.profiles;
CREATE TRIGGER after_profile_invite
AFTER UPDATE OF invite_code ON public.profiles
FOR EACH ROW
WHEN (NEW.invite_code IS NOT NULL AND (OLD.invite_code IS NULL OR OLD.invite_code <> NEW.invite_code))
EXECUTE FUNCTION public.handle_invite_referral();

-- 3. Recommended: Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_profiles_invite_code ON public.profiles(invite_code);
