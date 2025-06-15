
-- Add columns for daily streaks and CO2e weekly goal in profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_last_logged DATE,
ADD COLUMN IF NOT EXISTS co2e_weekly_goal NUMERIC DEFAULT 7.0, -- example: 7kg/week
ADD COLUMN IF NOT EXISTS co2e_weekly_progress NUMERIC DEFAULT 0.0;

-- Add a table for eco insights (user generated or system generated)
CREATE TABLE IF NOT EXISTS public.eco_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  insight TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add a challenges table, with audience scope (friends/community/world)
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reward_kelp_points INTEGER DEFAULT 0,
  audience_scope TEXT NOT NULL DEFAULT 'world', -- options: 'friends', 'community', 'world'
  community_id UUID REFERENCES public.communities(id),
  start_at TIMESTAMPTZ DEFAULT now(),
  end_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for participants in challenges
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE
);

-- Enable RLS for the new tables with basic policies
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view world challenges"
  ON public.challenges FOR SELECT
  USING (audience_scope = 'world' OR created_by = auth.uid());

CREATE POLICY "Community members can view community challenges"
  ON public.challenges FOR SELECT
  USING (
    audience_scope = 'community'
    AND community_id IN (
      SELECT community_id FROM public.community_memberships WHERE user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Friends can view friends challenges"
  ON public.challenges FOR SELECT
  USING (
    audience_scope = 'friends'
    AND (
      created_by IN (
        SELECT user2_id FROM public.friends WHERE user1_id = auth.uid()
        UNION
        SELECT user1_id FROM public.friends WHERE user2_id = auth.uid()
      )
      OR created_by = auth.uid()
    )
  );

CREATE POLICY "User can manage their own challenges"
  ON public.challenges FOR ALL
  USING (created_by = auth.uid());

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participant and challenge owner can view"
  ON public.challenge_participants FOR SELECT
  USING (
    user_id = auth.uid()
    OR challenge_id IN (SELECT id FROM public.challenges WHERE created_by = auth.uid())
  );
CREATE POLICY "User can join challenges"
  ON public.challenge_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS for eco_insights
ALTER TABLE public.eco_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view own and public insights"
  ON public.eco_insights FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "User can insert own insights"
  ON public.eco_insights FOR INSERT
  WITH CHECK (user_id = auth.uid());
