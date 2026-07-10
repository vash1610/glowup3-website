-- Tracks admin login attempts for rate limiting (replaces in-memory Map, which
-- does not survive Vercel serverless cold starts / multiple instances).
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  success BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_email_time
  ON admin_login_attempts(email, created_at);
