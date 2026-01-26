/*
  # Add preview path column for compressed previews

  1. Changes
    - Add `preview_path` column to photos table to store compressed preview images
    - This allows showing lightweight previews in the admin slider
    - Full-size images remain in storage_path for downloads
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'preview_path'
  ) THEN
    ALTER TABLE photos ADD COLUMN preview_path text;
  END IF;
END $$;
