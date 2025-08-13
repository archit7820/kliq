-- Add privacy and permission fields to communities table
ALTER TABLE public.communities 
ADD COLUMN privacy_type text NOT NULL DEFAULT 'public' CHECK (privacy_type IN ('public', 'private', 'invite_only')),
ADD COLUMN admin_permissions jsonb DEFAULT '{"can_create_challenges": true, "can_moderate_posts": true, "can_manage_members": true, "can_edit_community": true}'::jsonb,
ADD COLUMN member_permissions jsonb DEFAULT '{"can_post": true, "can_comment": true, "can_create_challenges": false}'::jsonb,
ADD COLUMN max_members integer DEFAULT NULL,
ADD COLUMN invite_code text UNIQUE DEFAULT NULL;

-- Create index for invite codes
CREATE INDEX idx_communities_invite_code ON public.communities(invite_code) WHERE invite_code IS NOT NULL;

-- Create community challenges table
CREATE TABLE public.community_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  title text NOT NULL,
  description text,
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone,
  is_active boolean DEFAULT true,
  challenge_type text DEFAULT 'group' CHECK (challenge_type IN ('group', 'individual', 'team')),
  reward_points integer DEFAULT 0,
  max_participants integer DEFAULT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on community challenges
ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;

-- RLS policies for community challenges
CREATE POLICY "Community members can view challenges" 
ON public.community_challenges 
FOR SELECT 
USING (
  community_id IN (
    SELECT community_id 
    FROM public.community_memberships 
    WHERE user_id = auth.uid() AND status = 'approved'
  )
);

CREATE POLICY "Community admins can manage challenges" 
ON public.community_challenges 
FOR ALL
USING (
  community_id IN (
    SELECT communities.id 
    FROM public.communities 
    WHERE communities.created_by = auth.uid()
  )
  OR 
  (
    community_id IN (
      SELECT community_id 
      FROM public.community_memberships 
      WHERE user_id = auth.uid() AND status = 'approved'
    )
    AND created_by = auth.uid()
  )
);

-- Create community challenge participants table
CREATE TABLE public.community_challenge_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id uuid NOT NULL REFERENCES public.community_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone DEFAULT now(),
  progress jsonb DEFAULT '{}',
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone DEFAULT NULL
);

-- Enable RLS
ALTER TABLE public.community_challenge_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for challenge participants
CREATE POLICY "Users can view challenge participants" 
ON public.community_challenge_participants 
FOR SELECT 
USING (
  challenge_id IN (
    SELECT cc.id 
    FROM public.community_challenges cc
    JOIN public.community_memberships cm ON cc.community_id = cm.community_id
    WHERE cm.user_id = auth.uid() AND cm.status = 'approved'
  )
);

CREATE POLICY "Users can join challenges" 
ON public.community_challenge_participants 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own progress" 
ON public.community_challenge_participants 
FOR UPDATE 
USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_community_challenges_updated_at
  BEFORE UPDATE ON public.community_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
BEGIN
  RETURN UPPER(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;