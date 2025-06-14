
-- Change kelp_points from INTEGER to NUMERIC to allow decimal values
ALTER TABLE public.profiles
ALTER COLUMN kelp_points TYPE NUMERIC;

-- Add a category column to the activities table
ALTER TABLE public.activities
ADD COLUMN category TEXT;
