-- Add 'system' to sender_type check constraint for ticket_messages
ALTER TABLE ticket_messages DROP CONSTRAINT IF EXISTS ticket_messages_sender_type_check;
ALTER TABLE ticket_messages ADD CONSTRAINT ticket_messages_sender_type_check 
  CHECK (sender_type IN ('customer', 'admin', 'system'));
