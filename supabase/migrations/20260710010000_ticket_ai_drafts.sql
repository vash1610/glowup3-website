-- Stores AI-generated ticket diagnoses/drafts. Never auto-sent to a customer -
-- only /api/admin/tickets/[id]/approve-send writes into ticket_messages, and
-- only after an admin explicitly approves.
CREATE TABLE IF NOT EXISTS ticket_ai_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  requested_by TEXT,
  diagnosis TEXT NOT NULL,
  can_resolve BOOLEAN NOT NULL DEFAULT FALSE,
  draft_reply TEXT,
  escalation_reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'discarded')),
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ticket_ai_drafts_ticket_id ON ticket_ai_drafts(ticket_id);
