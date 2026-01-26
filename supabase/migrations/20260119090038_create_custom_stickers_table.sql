/*
  # Create custom stickers table and storage

  1. New Tables
    - `custom_stickers`
      - `id` (uuid, primary key) - Unique identifier for each sticker
      - `name` (text) - Name of the sticker file
      - `image_url` (text) - URL path to the sticker in storage
      - `file_type` (text) - MIME type of the sticker (image/png, image/webp, etc)
      - `created_at` (timestamp) - When the sticker was uploaded
      
  2. Security
    - Enable RLS on `custom_stickers` table
    - Add policy for anyone to read stickers (public access)
    - Add policy for anyone to insert stickers (allow uploads)
    - Add policy for anyone to delete stickers
    
  3. Storage
    - Create public storage bucket for stickers
*/

-- Create the custom_stickers table
CREATE TABLE IF NOT EXISTS custom_stickers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  file_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE custom_stickers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view custom stickers" ON custom_stickers;
  DROP POLICY IF EXISTS "Anyone can upload custom stickers" ON custom_stickers;
  DROP POLICY IF EXISTS "Anyone can delete custom stickers" ON custom_stickers;
END $$;

-- Allow anyone to view all custom stickers
CREATE POLICY "Anyone can view custom stickers"
  ON custom_stickers
  FOR SELECT
  USING (true);

-- Allow anyone to upload custom stickers
CREATE POLICY "Anyone can upload custom stickers"
  ON custom_stickers
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to delete custom stickers
CREATE POLICY "Anyone can delete custom stickers"
  ON custom_stickers
  FOR DELETE
  USING (true);

-- Create storage bucket for stickers (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('stickers', 'stickers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the stickers bucket
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view stickers" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can upload stickers" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can delete stickers" ON storage.objects;
END $$;

CREATE POLICY "Anyone can view stickers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'stickers');

CREATE POLICY "Anyone can upload stickers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'stickers');

CREATE POLICY "Anyone can delete stickers"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'stickers');