
-- Create a table for available badges (gamified achievements & OG)
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  is_og_badge BOOLEAN DEFAULT FALSE,
  criteria JSONB, -- e.g. JSON: {kelp_points: 500, consecutive_days: 7}
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create a table for milestones (could be closely related to badges, but can be separated if needed)
CREATE TABLE public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  threshold NUMERIC NOT NULL,
  metric TEXT NOT NULL, -- e.g. 'kelp_points', 'offsets', etc.
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create a user_badges join table to assign (and timestamp) which user has which badge
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

-- Milestone achievements (per user)
CREATE TABLE public.user_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_id uuid NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  achieved_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, milestone_id)
);

-- OG badge/achievement logic:
-- assign OG badge to users among first 10,000 signups

-- Row Level Security
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to SELECT badges/milestones and see which ones they have
CREATE POLICY "Users can see badges/milestones" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Users can see milestones" ON public.milestones FOR SELECT USING (true);
CREATE POLICY "User can view their own badges" ON public.user_badges FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User can view their own milestones" ON public.user_milestones FOR SELECT USING (user_id = auth.uid());

-- Insert policies for user badges/milestones (users can only insert for themselves)
CREATE POLICY "User can earn badge for self" ON public.user_badges FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User can earn milestone for self" ON public.user_milestones FOR INSERT WITH CHECK (user_id = auth.uid());

-- Only backend/admin can add/delete badges/milestones (no public policy for INSERT/DELETE on those tables)

-- (Further business logic for automatic assignment will need to be implemented in Edge Functions or Triggers and hooked up in code)
