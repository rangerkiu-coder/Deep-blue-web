/*
  # Fix WhatsApp Tables Foreign Key Constraints

  1. Changes
    - Drop foreign key constraints from whatsapp_api_config and whatsapp_sent_messages
    - These tables use auth.uid() in RLS policies but had constraints referencing admin_users
    - Remove admin_users dependencies to allow direct auth.users integration

  2. Security
    - RLS policies remain in place and properly validate ownership using auth.uid()
    - No security impact as RLS is the primary security mechanism
*/

-- Drop foreign key constraints that reference admin_users
ALTER TABLE IF EXISTS whatsapp_api_config 
  DROP CONSTRAINT IF EXISTS whatsapp_api_config_admin_id_fkey;

ALTER TABLE IF EXISTS whatsapp_sent_messages 
  DROP CONSTRAINT IF EXISTS whatsapp_sent_messages_admin_id_fkey;
