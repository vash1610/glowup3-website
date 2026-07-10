# 📋 HOW TO APPLY THE ADMIN TABLES MIGRATION

## The Problem
Supabase CLI migration push is failing because local migrations don't match remote history.

## Solution: Manual SQL Execution

### Step 1: Go to Supabase SQL Editor
Open: https://app.supabase.com/project/ydnmhnutaitmbeybpwxc/sql/new

### Step 2: Copy and Paste the SQL Below

```sql
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

-- Insert default admin
INSERT INTO admin_credentials (email, passkey_hash) 
VALUES ('admin@glowup3.com', 'admin123')
ON CONFLICT (email) DO NOTHING;
```

### Step 3: Click "RUN"

### Step 4: Verify Tables Created
Run this query to verify:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('error_logs', 'user_flags', 'support_tickets', 
                   'admin_credentials', 'admin_sessions', 'admin_verification_codes',
                   'reports', 'transaction_log', 'stripe_events', 'escrow_transactions',
                   'page_views', 'service_usage_stats', 'cancellation_logs')
ORDER BY table_name;
```

---

## 🔑 Admin Login Credentials (After Setup)
- **Email:** admin@glowup3.com
- **Passkey:** admin123
- **Login URL:** `/login/admin`

---

## Need Help?
If you have issues, go to https://app.supabase.com/project/ydnmhnutaitmbeybpwxc/database/tables and create tables manually via the GUI.

---

## 🔧 Fix: Ticket Reply System Messages

If you can't reply to tickets, run this SQL to fix the constraint:

```sql
ALTER TABLE ticket_messages DROP CONSTRAINT IF EXISTS ticket_messages_sender_type_check;
ALTER TABLE ticket_messages ADD CONSTRAINT ticket_messages_sender_type_check 
  CHECK (sender_type IN ('customer', 'admin', 'system'));
```

---

## 🔒 Business Verification System Tables

Run this SQL in Supabase SQL Editor to create business verification tables:

```sql
-- 1. Business Verifications Table
CREATE TABLE IF NOT EXISTS business_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_id VARCHAR(100),
  declared_ico VARCHAR(20),
  declared_vat VARCHAR(50),
  declared_trade_license_number VARCHAR(100),
  declared_company_name VARCHAR(255),
  ico VARCHAR(20),
  company_name VARCHAR(255),
  legal_form VARCHAR(100),
  address TEXT,
  registration_date DATE,
  trade_license_number VARCHAR(100),
  trade_license_scope JSONB,
  trade_license_issue_date DATE,
  trade_license_status VARCHAR(20),
  vat_valid BOOLEAN,
  vat_country VARCHAR(10),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reasons TEXT[],
  confidence_score DECIMAL(5,4),
  ares_response JSONB,
  rzp_response JSONB,
  vies_response JSONB,
  ocr_extracted JSONB,
  document_hashes JSONB DEFAULT '[]',
  consent_timestamp TIMESTAMPTZ,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_search_at TIMESTAMPTZ,
  search_count INTEGER DEFAULT 1,
  manual_reviewer_id UUID,
  notes TEXT,
  source VARCHAR(20) DEFAULT 'automatic',
  verification_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bv_ico ON business_verifications(ico);
CREATE INDEX IF NOT EXISTS idx_bv_declared_ico ON business_verifications(declared_ico);
CREATE INDEX IF NOT EXISTS idx_bv_status ON business_verifications(status);
CREATE INDEX IF NOT EXISTS idx_bv_last_search ON business_verifications(last_search_at DESC);

-- 2. Verification Audit Logs
CREATE TABLE IF NOT EXISTS verification_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID REFERENCES business_verifications(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  actor_type VARCHAR(20) DEFAULT 'system',
  actor_id UUID,
  action VARCHAR(100),
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  payload JSONB,
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_verification_id ON verification_audit_logs(verification_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON verification_audit_logs(created_at DESC);

-- 3. Verification Cache
CREATE TABLE IF NOT EXISTS verification_cache (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  source VARCHAR(20) NOT NULL,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cache_expires ON verification_cache(expires_at) WHERE expires_at > NOW();

-- 4. Verification Templates
CREATE TABLE IF NOT EXISTS verification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type VARCHAR(50) NOT NULL,
  language VARCHAR(10) DEFAULT 'cs',
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  variables JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO verification_templates (template_type, language, subject, body) VALUES
('request_docs', 'en', 'Business verification documents needed', 'Dear {{name}}, We couldn''t confirm your trade license. Please upload a clear scan of your živnostenský list. Best regards, GlowUp3 Team'),
('rejected', 'en', 'Business verification unsuccessful', 'Dear {{name}}, We could not verify your business registration. Please contact support. Best regards, GlowUp3 Team'),
('verified', 'en', 'Business verification complete', 'Dear {{name}}, Your company {{company_name}} (IČO: {{ico}}) is now verified. Best regards, GlowUp3 Team')
ON CONFLICT DO NOTHING;

-- Disable RLS for admin operations
ALTER TABLE business_verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_templates DISABLE ROW LEVEL SECURITY;
```

After running, verify with:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('business_verifications', 'verification_audit_logs', 'verification_cache', 'verification_templates')
ORDER BY table_name;
```

