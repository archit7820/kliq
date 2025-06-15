
-- Update get_user_conversations to not include messages where you messaged yourself
CREATE OR REPLACE FUNCTION public.get_user_conversations()
RETURNS TABLE (
  other_user_id uuid,
  full_name text,
  username text,
  avatar_url text,
  last_message_content text,
  last_message_at timestamptz,
  unread_count bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH message_partners AS (
    SELECT
      CASE
        WHEN sender_id = auth.uid() THEN receiver_id
        ELSE sender_id
      END AS other_user_id
    FROM public.direct_messages
    WHERE (sender_id = auth.uid() OR receiver_id = auth.uid())
      AND sender_id <> receiver_id  -- Ignore self-messages!
  ),
  distinct_partners AS (
    SELECT DISTINCT ON (other_user_id) other_user_id
    FROM message_partners
  ),
  latest_messages AS (
    SELECT
      DISTINCT ON (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id))
      id,
      content,
      created_at,
      sender_id,
      receiver_id
    FROM public.direct_messages
    WHERE (sender_id = auth.uid() OR receiver_id = auth.uid())
      AND sender_id <> receiver_id  -- Ignore self-messages!
    ORDER BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), created_at DESC
  )
  SELECT
    p.other_user_id,
    pr.full_name,
    pr.username,
    pr.avatar_url,
    lm.content AS last_message_content,
    lm.created_at AS last_message_at,
    (
      SELECT count(*)
      FROM public.direct_messages
      WHERE receiver_id = auth.uid() AND sender_id = p.other_user_id AND is_read = FALSE
    ) AS unread_count
  FROM distinct_partners p
  JOIN public.profiles pr ON p.other_user_id = pr.id
  LEFT JOIN latest_messages lm ON
    (lm.sender_id = p.other_user_id AND lm.receiver_id = auth.uid()) OR
    (lm.sender_id = auth.uid() AND lm.receiver_id = p.other_user_id)
  ORDER BY lm.created_at DESC;
$$;
