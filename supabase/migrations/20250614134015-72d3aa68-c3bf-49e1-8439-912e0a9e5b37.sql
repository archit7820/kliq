
-- Table to track different communities (created by users or Kelp team)
CREATE TABLE public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES public.profiles(id) NOT NULL,
  is_official boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for membership of users in communities
CREATE TABLE public.community_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  community_id uuid REFERENCES public.communities(id) NOT NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, community_id)
);

-- Table for activities posted within a community
CREATE TABLE public.community_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES public.communities(id) NOT NULL,
  activity_id uuid REFERENCES public.activities(id) NOT NULL,
  posted_at timestamp with time zone NOT NULL DEFAULT now()
);

-- (Optional) Table for group chat messages in a community
CREATE TABLE public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES public.communities(id) NOT NULL,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- RLS: Allow users to select all public communities but only insert/update/delete their own
CREATE POLICY "View all communities" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Create communities" ON public.communities FOR INSERT WITH CHECK ( created_by = auth.uid() );
CREATE POLICY "Edit own community" ON public.communities FOR UPDATE USING ( created_by = auth.uid() );
CREATE POLICY "Delete own community" ON public.communities FOR DELETE USING ( created_by = auth.uid() );

-- RLS: Memberships (users can see, join, leave communities they are part of)
CREATE POLICY "View memberships" ON public.community_memberships FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Join community" ON public.community_memberships FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Leave community" ON public.community_memberships FOR DELETE USING (user_id = auth.uid());

-- RLS: Community activities (members can see)
CREATE POLICY "View community activities" ON public.community_activities FOR SELECT USING (
  community_id IN (SELECT community_id FROM public.community_memberships WHERE user_id = auth.uid())
);

-- RLS: Community messages (only for members)
CREATE POLICY "View community messages" ON public.community_messages FOR SELECT USING (
  community_id IN (SELECT community_id FROM public.community_memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Send message" ON public.community_messages FOR INSERT WITH CHECK (
  user_id = auth.uid() AND 
  community_id IN (SELECT community_id FROM public.community_memberships WHERE user_id = auth.uid())
);

