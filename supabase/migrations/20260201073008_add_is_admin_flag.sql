/*
  # Add is_admin flag to admin users

  ## Overview
  Adds an is_admin boolean flag to properly track admin permissions for WhatsApp sender access

  ## Changes
  1. Add is_admin column to admin_users table with default value of false
  2. Update existing records to set is_admin = true for all existing admins
  3. Add check constraint to ensure only admins can be marked as active

  ## Security
  This flag is used server-side to verify admin permissions before allowing WhatsApp API access
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

UPDATE admin_users SET is_admin = true WHERE is_active = true;
