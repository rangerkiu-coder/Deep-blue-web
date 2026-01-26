/*
  # Create photos table for admin dashboard

  1. New Tables
    - `photos`
      - `id` (uuid, primary key) - Unique identifier for each photo
      - `image_data` (text) - Base64 encoded image data URL
      - `created_at` (timestamptz) - Timestamp when photo was created
  
  2. Security
    - Enable RLS on `photos` table
    - Add policy to allow anyone to insert photos (public photobooth)
    - Add policy to allow anyone to read photos (for admin dashboard)
    - Add policy to allow anyone to delete photos (for admin cleanup)
    
  Note: This is a public photobooth installation, so we allow unrestricted access.
  In production, you may want to add authentication for the admin dashboard.
*/

CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_data text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert photos (public photobooth)
CREATE POLICY "Anyone can insert photos"
  ON photos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to read photos (for admin dashboard)
CREATE POLICY "Anyone can read photos"
  ON photos
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to delete photos (for admin cleanup)
CREATE POLICY "Anyone can delete photos"
  ON photos
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create index for faster queries sorted by creation date
CREATE INDEX IF NOT EXISTS photos_created_at_idx ON photos(created_at DESC);