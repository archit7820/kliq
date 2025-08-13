-- Fix security warnings by setting proper search paths for functions
DROP FUNCTION IF EXISTS award_kelp_points(uuid, numeric, text, text, text, jsonb);
DROP FUNCTION IF EXISTS spend_kelp_points(uuid, numeric, text, text, jsonb);

-- Create function to award kelp points with proper security
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
SET search_path = ''
AS $$
BEGIN
  -- Insert transaction record
  INSERT INTO public.kelp_transactions (user_id, amount, transaction_type, source, description, metadata)
  VALUES (p_user_id, p_amount, p_transaction_type, p_source, p_description, p_metadata);
  
  -- Update user's kelp_points
  UPDATE public.profiles 
  SET kelp_points = COALESCE(kelp_points, 0) + p_amount,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_user_id;
END;
$$;

-- Create function to spend kelp points with proper security
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
SET search_path = ''
AS $$
DECLARE
  current_points numeric;
BEGIN
  -- Get current points
  SELECT COALESCE(kelp_points, 0) INTO current_points 
  FROM public.profiles WHERE id = p_user_id;
  
  -- Check if user has enough points
  IF current_points < p_amount THEN
    RETURN false;
  END IF;
  
  -- Insert transaction record (negative amount for spending)
  INSERT INTO public.kelp_transactions (user_id, amount, transaction_type, source, description, metadata)
  VALUES (p_user_id, -p_amount, 'spent', p_source, p_description, p_metadata);
  
  -- Update user's kelp_points
  UPDATE public.profiles 
  SET kelp_points = kelp_points - p_amount,
      updated_at = timezone('utc'::text, now())
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$;

-- Create function to claim daily bonus
CREATE OR REPLACE FUNCTION claim_daily_bonus(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_streak_day integer := 1;
  v_last_bonus_date date;
  v_points_earned integer;
  v_result jsonb;
BEGIN
  -- Check if already claimed today
  IF EXISTS (
    SELECT 1 FROM public.kelp_daily_bonuses 
    WHERE user_id = p_user_id AND date = CURRENT_DATE
  ) THEN
    RETURN '{"success": false, "message": "Daily bonus already claimed today"}'::jsonb;
  END IF;
  
  -- Get last bonus date
  SELECT date INTO v_last_bonus_date
  FROM public.kelp_daily_bonuses
  WHERE user_id = p_user_id
  ORDER BY date DESC
  LIMIT 1;
  
  -- Calculate streak
  IF v_last_bonus_date IS NOT NULL THEN
    IF v_last_bonus_date = CURRENT_DATE - INTERVAL '1 day' THEN
      -- Continue streak
      SELECT streak_day + 1 INTO v_streak_day
      FROM public.kelp_daily_bonuses
      WHERE user_id = p_user_id AND date = v_last_bonus_date;
    ELSE
      -- Reset streak
      v_streak_day := 1;
    END IF;
  END IF;
  
  -- Calculate points based on streak (base 10 + bonus for streaks)
  v_points_earned := 10 + LEAST(v_streak_day - 1, 20); -- Max 30 points per day
  
  -- Insert daily bonus record
  INSERT INTO public.kelp_daily_bonuses (user_id, date, points_earned, streak_day)
  VALUES (p_user_id, CURRENT_DATE, v_points_earned, v_streak_day);
  
  -- Award the points
  PERFORM award_kelp_points(
    p_user_id, 
    v_points_earned, 
    'daily_bonus', 
    'daily_login', 
    'Daily login bonus - Day ' || v_streak_day,
    ('{"streak_day": ' || v_streak_day || '}')::jsonb
  );
  
  v_result := json_build_object(
    'success', true,
    'points_earned', v_points_earned,
    'streak_day', v_streak_day,
    'message', 'Daily bonus claimed successfully!'
  );
  
  RETURN v_result;
END;
$$;