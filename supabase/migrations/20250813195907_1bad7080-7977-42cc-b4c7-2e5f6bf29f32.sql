-- Create kelp_transactions table for tracking all point transactions
CREATE TABLE public.kelp_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'referral', 'purchase', 'daily_bonus')),
  source text NOT NULL, -- activity_id, achievement_id, purchase_id, etc.
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create kelp_rewards table for available rewards/items
CREATE TABLE public.kelp_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  cost_points integer NOT NULL,
  category text NOT NULL DEFAULT 'discount',
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  stock_limit integer, -- null = unlimited
  stock_remaining integer,
  expires_at timestamp with time zone,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create kelp_purchases table for tracking user purchases
CREATE TABLE public.kelp_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  reward_id uuid NOT NULL,
  points_spent integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'redeemed', 'expired')),
  redemption_code text,
  redeemed_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create kelp_achievements table for gamification
CREATE TABLE public.kelp_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  points_reward integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'general',
  icon text, -- emoji or icon identifier
  criteria jsonb NOT NULL, -- conditions for earning the achievement
  is_active boolean NOT NULL DEFAULT true,
  rarity text NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create user_kelp_achievements for tracking earned achievements
CREATE TABLE public.user_kelp_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL,
  earned_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, achievement_id)
);

-- Create kelp_daily_bonuses for tracking daily login bonuses
CREATE TABLE public.kelp_daily_bonuses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  points_earned integer NOT NULL,
  streak_day integer NOT NULL DEFAULT 1,
  claimed_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.kelp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kelp_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kelp_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kelp_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_kelp_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kelp_daily_bonuses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kelp_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.kelp_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" 
ON public.kelp_transactions 
FOR INSERT 
WITH CHECK (true); -- Will be handled by functions

-- RLS Policies for kelp_rewards
CREATE POLICY "Everyone can view active rewards" 
ON public.kelp_rewards 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for kelp_purchases
CREATE POLICY "Users can view their own purchases" 
ON public.kelp_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases" 
ON public.kelp_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases" 
ON public.kelp_purchases 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for kelp_achievements
CREATE POLICY "Everyone can view active achievements" 
ON public.kelp_achievements 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for user_kelp_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_kelp_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can award achievements" 
ON public.user_kelp_achievements 
FOR INSERT 
WITH CHECK (true); -- Will be handled by functions

-- RLS Policies for kelp_daily_bonuses
CREATE POLICY "Users can view their own daily bonuses" 
ON public.kelp_daily_bonuses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can claim daily bonuses" 
ON public.kelp_daily_bonuses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to award kelp points
CREATE OR REPLACE FUNCTION award_kelp_points(
  p_user_id uuid,
  p_amount numeric,
  p_transaction_type text,
  p_source text,
  p_description text,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert transaction record
  INSERT INTO kelp_transactions (user_id, amount, transaction_type, source, description, metadata)
  VALUES (p_user_id, p_amount, p_transaction_type, p_source, p_description, p_metadata);
  
  -- Update user's kelp_points
  UPDATE profiles 
  SET kelp_points = COALESCE(kelp_points, 0) + p_amount,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_user_id;
END;
$$;

-- Create function to spend kelp points
CREATE OR REPLACE FUNCTION spend_kelp_points(
  p_user_id uuid,
  p_amount numeric,
  p_source text,
  p_description text,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_points numeric;
BEGIN
  -- Get current points
  SELECT COALESCE(kelp_points, 0) INTO current_points 
  FROM profiles WHERE id = p_user_id;
  
  -- Check if user has enough points
  IF current_points < p_amount THEN
    RETURN false;
  END IF;
  
  -- Insert transaction record (negative amount for spending)
  INSERT INTO kelp_transactions (user_id, amount, transaction_type, source, description, metadata)
  VALUES (p_user_id, -p_amount, 'spent', p_source, p_description, p_metadata);
  
  -- Update user's kelp_points
  UPDATE profiles 
  SET kelp_points = kelp_points - p_amount,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$;