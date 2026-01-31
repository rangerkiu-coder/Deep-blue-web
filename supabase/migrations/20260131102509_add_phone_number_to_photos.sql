/*
  # Add phone number field to photos table

  1. Changes
    - Add `phone_number` column to `photos` table
      - `phone_number` (text, nullable) - Customer's phone number for sending soft copy
  
  2. Notes
    - Phone number is optional to support existing photos without phone numbers
    - No security changes needed as existing RLS policies cover this field
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE photos ADD COLUMN phone_number text;
  END IF;
END $$;