
-- Create a storage bucket for challenge verification snaps
insert into storage.buckets (id, name, public)
values ('challenge_verification_snaps', 'challenge_verification_snaps', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload their snaps
create policy "Authenticated users can upload challenge verification snaps"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'challenge_verification_snaps');

-- Allow all users to view verification snaps (publicly visible)
create policy "Anyone can view challenge verification snaps"
  on storage.objects for select
  using (bucket_id = 'challenge_verification_snaps');
