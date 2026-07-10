-- Ticket Messages table for threaded conversations
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL,
  sender_id TEXT NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'admin', 'system')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_sender ON ticket_messages(sender_id, sender_type);

-- Add columns to support_tickets if they don't exist
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- Function to update message count
CREATE OR REPLACE FUNCTION update_ticket_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE support_tickets SET message_count = message_count + 1 WHERE id = NEW.ticket_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE support_tickets SET message_count = message_count - 1 WHERE id = OLD.ticket_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain message count
DROP TRIGGER IF EXISTS trg_update_message_count ON ticket_messages;
CREATE TRIGGER trg_update_message_count
AFTER INSERT OR DELETE ON ticket_messages
FOR EACH ROW EXECUTE FUNCTION update_ticket_message_count();