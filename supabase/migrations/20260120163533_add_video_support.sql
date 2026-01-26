/*
  # Add video support to photos table

  1. Changes
    - Add `is_video` column to `photos` table to distinguish between images and videos
    - The column defaults to false for backward compatibility with existing photos

  2. Details
    - `is_video` (boolean, default false) - Flag to indicate if the entry is a video or still image
    - All existing photos will be marked as images (false)
    - New video entries will set this to true when saved
*/

-- Add is_video column with default false
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'is_video'
  ) THEN
    ALTER TABLE photos ADD COLUMN is_video boolean DEFAULT false NOT NULL;
  END IF;
END $$;
