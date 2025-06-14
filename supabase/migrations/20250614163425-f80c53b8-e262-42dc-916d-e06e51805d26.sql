
-- Allow authenticated users to upload avatar images (correct INSERT policy)
CREATE POLICY "Authenticated users can upload avatar images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update their own avatars (for overwrite)
CREATE POLICY "Authenticated users can update avatar images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

-- Allow any user to SELECT (download/view) avatar images (for public avatars)
CREATE POLICY "Anyone can view avatar images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
