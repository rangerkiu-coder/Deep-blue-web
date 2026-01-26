/*
  # Migrate photos to use Supabase Storage

  1. Schema Changes
    - Add `storage_path` column to `photos` table to store the file path in Supabase Storage
    - Make `image_data` column nullable for backward compatibility
    - The storage path will be in format: `photos/{uuid}.jpg`

  2. Storage Setup
    - Create a public storage bucket named `photos` for storing photo booth images
    - Enable public access for reading photos
    - Allow anyone to upload photos (public photobooth)
    - Allow anyone to delete photos (for admin cleanup)

  3. Migration Strategy
    - New photos will use storage_path instead of image_data
    - Existing photos with image_data will continue to work
    - Over time, old photos can be migrated to storage if needed
*/

-- Add storage_path column to photos table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE photos ADD COLUMN storage_path text;
  END IF;
END $$;

-- Make image_data nullable for new storage-based photos
ALTER TABLE photos 
ALTER COLUMN image_data DROP NOT NULL;

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload photos to the bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can upload photos'
  ) THEN
    CREATE POLICY "Anyone can upload photos"
      ON storage.objects
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (bucket_id = 'photos');
  END IF;
END $$;

-- Allow anyone to read photos from the bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can read photos'
  ) THEN
    CREATE POLICY "Anyone can read photos"
      ON storage.objects
      FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'photos');
  END IF;
END $$;

-- Allow anyone to delete photos from the bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can delete photos'
  ) THEN
    CREATE POLICY "Anyone can delete photos"
      ON storage.objects
      FOR DELETE
      TO anon, authenticated
      USING (bucket_id = 'photos');
  END IF;
END $$;

-- Create index on storage_path for faster lookups
CREATE INDEX IF NOT EXISTS photos_storage_path_idx ON photos(storage_path);