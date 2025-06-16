
-- First, let's clean up and create a proper invite system
-- Drop the old invites table and recreate it with better structure
DROP TABLE IF EXISTS public.invites CASCADE;

-- Create a unified invite system using referral_code from profiles
-- Every user gets a referral_code when they sign up, and can use others' codes to join

-- Update the profiles table to ensure every user has a referral_code
-- and track who invited them
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS invited_by_code TEXT,
ADD COLUMN IF NOT EXISTS invited_by_user_id UUID REFERENCES public.profiles(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_invited_by_code ON public.profiles(invited_by_code);

-- Update the handle_new_user function to always generate a referral code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    UPPER(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8))
  );
  RETURN NEW;
END;
$$;

-- Create a function to handle invite referrals when invite_code is set
CREATE OR REPLACE FUNCTION public.handle_invite_usage()
RETURNS TRIGGER AS $$
DECLARE
  inviter_id UUID;
BEGIN
  -- Only process if invite_code is being set for the first time
  IF NEW.invite_code IS NOT NULL AND (OLD.invite_code IS NULL OR OLD.invite_code <> NEW.invite_code) THEN
    -- Find the user who owns this referral code
    SELECT id INTO inviter_id 
    FROM public.profiles 
    WHERE referral_code = NEW.invite_code;
    
    IF inviter_id IS NOT NULL THEN
      -- Update the new user's record
      NEW.invited_by_code := NEW.invite_code;
      NEW.invited_by_user_id := inviter_id;
      
      -- Award kelp points to both users
      UPDATE public.profiles
      SET kelp_points = COALESCE(kelp_points, 0) + 50
      WHERE id = inviter_id;
      
      UPDATE public.profiles
      SET kelp_points = COALESCE(kelp_points, 0) + 50
      WHERE id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invite handling
DROP TRIGGER IF EXISTS after_profile_invite ON public.profiles;
CREATE TRIGGER after_profile_invite
  AFTER UPDATE OF invite_code ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_invite_usage();

-- Create a function to validate invite codes
CREATE OR REPLACE FUNCTION public.is_valid_invite_code(code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE referral_code = code
  );
$$;
