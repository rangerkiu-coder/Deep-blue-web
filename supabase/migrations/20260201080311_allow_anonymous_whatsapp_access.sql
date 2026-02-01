/*
  # Allow Anonymous Access to WhatsApp Messages

  1. Changes
    - Drop existing RLS policies on whatsapp_sent_messages table
    - Create new policy allowing anonymous SELECT access
    - Create new policy allowing anonymous INSERT access
    
  2. Security
    - No authentication required since admin access is controlled by PIN
    - Data is still protected by application-level security
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own sent messages" ON whatsapp_sent_messages;
DROP POLICY IF EXISTS "Users can insert own sent messages" ON whatsapp_sent_messages;

-- Allow anonymous SELECT access
CREATE POLICY "Allow anonymous to view sent messages"
  ON whatsapp_sent_messages
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous INSERT access
CREATE POLICY "Allow anonymous to insert sent messages"
  ON whatsapp_sent_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);
