
-- Add a 'status' column to track join requests and approvals
ALTER TABLE public.community_memberships
ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'; -- existing memberships will be auto-approved

-- Allowable values: 'pending', 'approved', 'rejected'
-- (You may enforce with a CHECK, but text is more flexible for extension)

-- Update policies if needed (existing insert can stay, only approve-own handled in code)
