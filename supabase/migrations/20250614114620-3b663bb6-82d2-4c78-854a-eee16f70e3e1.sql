
-- Create a table to store logged activities
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caption TEXT,
  activity TEXT NOT NULL,
  carbon_footprint_kg NUMERIC NOT NULL,
  explanation TEXT,
  emoji TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for the activities table
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own activities
CREATE POLICY "Users can view their own activities"
  ON public.activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON public.activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
  ON public.activities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
  ON public.activities FOR DELETE
  USING (auth.uid() = user_id);

-- Create a storage bucket for activity images
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity_images', 'activity_images', true);

-- Create policies for the activity_images bucket
CREATE POLICY "Authenticated users can upload activity images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'activity_images');

CREATE POLICY "Anyone can view activity images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'activity_images');

