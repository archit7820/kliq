
-- 1. Create list of recognized green activities (update as needed!)
-- For extensibility, use ILIKE (case-insensitive, partial) match:
-- walking, running, cycling, bike, planting, trees, public transport, carpool, recycling, compost, solar

CREATE OR REPLACE FUNCTION public.make_green_activity_negative()
RETURNS TRIGGER AS $$
DECLARE
  green_keywords TEXT[] := ARRAY[
    'walk', 'run', 'cycle', 'bike', 'plant', 'tree', 'public transport',
    'carpool', 'recycl', 'compost', 'solar', 'bus', 'train', 'subway', 'skate', 'scooter'
  ];
  is_green BOOL := FALSE;
  keyword TEXT;
BEGIN
  -- Loop: match activity name with green keywords
  IF NEW.activity IS NULL THEN
    RETURN NEW;
  END IF;

  FOREACH keyword IN ARRAY green_keywords LOOP
    IF position(lower(keyword) in lower(NEW.activity)) > 0 THEN
      is_green := TRUE;
      EXIT;
    END IF;
  END LOOP;

  IF is_green THEN
    -- If the entered value is positive, flip to negative.
    IF NEW.carbon_footprint_kg > 0 THEN
      NEW.carbon_footprint_kg := NEW.carbon_footprint_kg * -1;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Add trigger on INSERT/UPDATE for activities
DROP TRIGGER IF EXISTS trg_make_green_activity_negative ON public.activities;

CREATE TRIGGER trg_make_green_activity_negative
BEFORE INSERT OR UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.make_green_activity_negative();
