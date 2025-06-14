
-- Table for invite codes (referral-based onboarding)
CREATE TABLE public.invites (
  code TEXT PRIMARY KEY,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consumed_by UUID REFERENCES public.profiles(id),
  consumed_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  usage_limit INT NOT NULL DEFAULT 1,           -- how many times this code can be used
  usage_count INT NOT NULL DEFAULT 0            -- how many times has been used
);

-- RLS: Only allow SELECT/INSERT for registered users
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can use active invites"
  ON public.invites FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Insert invite as user"
  ON public.invites FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- (Optional) Policy: Consumed_by only settable by the consuming user

-- Add a column to profiles for invite_code (to track how user joined)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invite_code TEXT REFERENCES public.invites(code);

