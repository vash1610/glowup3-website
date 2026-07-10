-- Single-row table for admin dashboard preferences. Enforced by is_singleton
-- unique constraint trick (a constant expression index) so there's never more
-- than one settings row to get out of sync.
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name TEXT NOT NULL DEFAULT 'Todayly',
  support_email TEXT NOT NULL DEFAULT 'support@todayly.app',
  timezone TEXT NOT NULL DEFAULT 'Europe/Prague',
  session_timeout_hours INTEGER NOT NULL DEFAULT 2 CHECK (session_timeout_hours BETWEEN 1 AND 168),
  email_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  slack_integration BOOLEAN NOT NULL DEFAULT FALSE,
  slack_webhook_url TEXT,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  accent_color TEXT NOT NULL DEFAULT '#667eea',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_settings_singleton ON admin_settings ((true));

INSERT INTO admin_settings (platform_name, support_email)
VALUES ('Todayly', 'support@todayly.app')
ON CONFLICT DO NOTHING;
