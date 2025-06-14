
-- Table for friend requests
CREATE TABLE public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Friends relation table (for confirmed friendships)
CREATE TABLE public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Prevent duplicate friendships (friendship is mutual)
CREATE UNIQUE INDEX unique_friendship ON public.friends (
  LEAST(user1_id, user2_id),
  GREATEST(user1_id, user2_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Policies for friend_requests
CREATE POLICY "Users can view friend requests involving themselves"
  ON public.friend_requests FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send friend requests as sender"
  ON public.friend_requests FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their sent/received requests"
  ON public.friend_requests FOR UPDATE
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can delete friend requests involving themselves"
  ON public.friend_requests FOR DELETE
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Policies for friends table
CREATE POLICY "Users can view their friendships"
  ON public.friends FOR SELECT
  USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can insert friendship involving themselves"
  ON public.friends FOR INSERT
  WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can delete their own friendships"
  ON public.friends FOR DELETE
  USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Trigger to update updated_at on friend_requests change
CREATE OR REPLACE FUNCTION public.update_friend_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_friend_request_update
  BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_friend_requests_updated_at();

