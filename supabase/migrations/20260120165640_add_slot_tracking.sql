/*
  # Add slot tracking for multi-video sessions

  1. Changes
    - Add `slot_index` column to track which slot a video belongs to
    - Add `session_id` column to group multiple videos from the same capture session
    - The columns allow null for backward compatibility with existing single-video entries

  2. Details
    - `slot_index` (integer, nullable) - The index of the slot (0, 1, 2, etc.) for multi-video layouts
    - `session_id` (text, nullable) - UUID to group related photos/videos from same session
    - Existing photos will have null values for these columns
*/

-- Add slot_index column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'slot_index'
  ) THEN
    ALTER TABLE photos ADD COLUMN slot_index integer;
  END IF;
END $$;

-- Add session_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE photos ADD COLUMN session_id text;
  END IF;
END $$;
