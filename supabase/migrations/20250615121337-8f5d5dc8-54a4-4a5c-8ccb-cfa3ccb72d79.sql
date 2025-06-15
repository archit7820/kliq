
-- Keep the 3 most recent global challenges, delete the rest (leaving community/friends scope untouched)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY audience_scope
    ORDER BY created_at DESC
  ) AS rn
  FROM public.challenges
  WHERE audience_scope = 'world'
)
DELETE FROM public.challenges
WHERE id IN (
  SELECT id FROM ranked WHERE audience_scope = 'world' AND rn > 3
);

-- Optional: You may want to also cleanup any orphaned challenge_participants for deleted challenges
-- DELETE FROM public.challenge_participants
-- WHERE challenge_id NOT IN (SELECT id FROM public.challenges);

