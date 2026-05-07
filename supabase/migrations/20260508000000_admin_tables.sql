-- 1. error_logs
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_code VARCHAR(50),
  error_type VARCHAR(100),
  message TEXT NOT NULL,
  stack_trace TEXT,
  severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  user_id TEXT,
  user_type VARCHAR(20),
  endpoint TEXT,
  method VARCHAR(10),
  request_body JSONB,
  response_status INTEGER,
  metadata JSONB,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_error_logs_occurred_at ON error_logs(occurred_at DESC);

-- 2. user_flags
CREATE TABLE IF NOT EXISTS user_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'professional')),
  flag_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium',
  description TEXT,
  evidence JSONB,
  flagged_by TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_flags_user_id ON user_flags(user_id);

-- 3. support_tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'open',
  assigned_to TEXT,
  messages JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  customer_rating INTEGER,
  customer_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- 4. admin_credentials
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  passkey_hash VARCHAR(255) NOT NULL,
  totp_secret VARCHAR(255),
  is_totp_enabled BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. admin_sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_credentials(id),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);

-- 6. admin_verification_codes
CREATE TABLE IF NOT EXISTS admin_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_credentials(id),
  code_hash VARCHAR(255) NOT NULL,
  code_type VARCHAR(20) DEFAULT 'email',
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id TEXT NOT NULL,
  reporter_type VARCHAR(20) NOT NULL,
  reported_user_id TEXT NOT NULL,
  reported_user_type VARCHAR(20) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  assigned_to TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 8. transaction_log
CREATE TABLE IF NOT EXISTS transaction_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type VARCHAR(50) NOT NULL,
  amount_czk INTEGER NOT NULL,
  balance_before INTEGER,
  balance_after INTEGER,
  user_id TEXT,
  user_type VARCHAR(20),
  reference_id TEXT,
  reference_type VARCHAR(50),
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  metadata JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. stripe_events
CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  api_version VARCHAR(50),
  created TIMESTAMPTZ,
  data JSONB NOT NULL,
  livemode BOOLEAN DEFAULT FALSE,
  pending_webhooks INTEGER,
  request JSONB,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. escrow_transactions
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  pro_id TEXT NOT NULL,
  amount_czk INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'held',
  released_amount INTEGER DEFAULT 0,
  released_at TIMESTAMPTZ,
  refunded_amount INTEGER DEFAULT 0,
  refunded_at TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. page_views
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  user_type VARCHAR(20),
  session_id VARCHAR(255),
  screen_name VARCHAR(100) NOT NULL,
  route_path VARCHAR(255),
  duration_seconds INTEGER,
  referrer VARCHAR(255),
  device_type VARCHAR(50),
  os_version VARCHAR(50),
  app_version VARCHAR(50),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 12. service_usage_stats
CREATE TABLE IF NOT EXISTS service_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id TEXT,
  service_id TEXT,
  service_name VARCHAR(255),
  category VARCHAR(100),
  booking_count INTEGER DEFAULT 0,
  revenue_czk INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pro_id, service_id, period_start)
);

-- 13. cancellation_logs
CREATE TABLE IF NOT EXISTS cancellation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id TEXT NOT NULL,
  cancelled_by_id TEXT NOT NULL,
  cancelled_by_type VARCHAR(20) NOT NULL,
  cancellation_type VARCHAR(50) NOT NULL,
  reason TEXT,
  reservation_fee_refunded BOOLEAN DEFAULT FALSE,
  refund_amount INTEGER DEFAULT 0,
  penalty_applied BOOLEAN DEFAULT FALSE,
  penalty_amount INTEGER DEFAULT 0,
  pro_notified BOOLEAN DEFAULT FALSE,
  customer_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin (passkey: glowup3-admin-xK9mP2vL8nQ4rT6w)
INSERT INTO admin_credentials (email, passkey_hash) 
VALUES ('admin@glowup3.com', 'admin123')
ON CONFLICT (email) DO NOTHING;
