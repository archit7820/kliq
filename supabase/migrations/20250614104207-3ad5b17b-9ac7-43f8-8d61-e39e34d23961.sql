
-- Create a table for public user profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  location TEXT,
  lifestyle_tags TEXT[], -- Array of text for tags like 'travel', 'food'
  kelp_points INTEGER DEFAULT 0,
  is_og_user BOOLEAN DEFAULT FALSE,
  referral_code TEXT UNIQUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to the table and columns
COMMENT ON TABLE public.profiles IS 'Public user profile information linked to authenticated users.';
COMMENT ON COLUMN public.profiles.id IS 'References the user ID from auth.users.';
COMMENT ON COLUMN public.profiles.kelp_points IS 'Points earned by the user for eco-friendly actions.';
COMMENT ON COLUMN public.profiles.is_og_user IS 'Flag for the first 1000 users.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles:
-- 1. Users can view their own profile.
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 2. Users can insert their own profile.
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Users can update their own profile.
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Allow all authenticated users to view other users' (limited) public profile info.
-- For now, let's keep it simple and only allow viewing username, avatar_url, kelp_points.
-- We can expand this later for leaderboards etc.
CREATE POLICY "Authenticated users can view basic public profiles."
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');
  -- If you want to restrict columns, you'd typically handle that in your SELECT query
  -- or by creating a view. For RLS, this policy allows selecting all columns.
  -- We'll filter columns in the application code.

-- Function to automatically create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, referral_code)
  VALUES (
    NEW.id,
    NEW.email, -- Using email as a placeholder for username initially
    substring(md5(random()::text || clock_timestamp()::text) from 1 for 8) -- Generate a simple random referral code
  );
  RETURN NEW;
END;
$$;

-- Trigger to call the function after a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile changes
CREATE TRIGGER handle_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

