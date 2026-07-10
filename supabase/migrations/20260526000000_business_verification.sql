-- Business Verification System - Complete Migration
-- Run this first to create all tables, then run tracking migration

-- 1. Business Verifications Table
CREATE TABLE IF NOT EXISTS business_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_id VARCHAR(100),
  
  -- Declared Business Data
  declared_ico VARCHAR(20),
  declared_vat VARCHAR(50),
  declared_trade_license_number VARCHAR(100),
  declared_company_name VARCHAR(255),
  
  -- Normalized Business Record
  ico VARCHAR(20),
  company_name VARCHAR(255),
  legal_form VARCHAR(100),
  address TEXT,
  registration_date DATE,
  
  -- Trade License (RŽP)
  trade_license_number VARCHAR(100),
  trade_license_scope JSONB,
  trade_license_issue_date DATE,
  trade_license_status VARCHAR(20),
  
  -- VAT Status
  vat_valid BOOLEAN,
  vat_country VARCHAR(10),
  
  -- Verification Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'verified', 'requires_action', 'rejected', 'not_found'
  )),
  reasons TEXT[],
  confidence_score DECIMAL(5,4),
  
  -- Evidence from Registries
  ares_response JSONB,
  rzp_response JSONB,
  vies_response JSONB,
  ocr_extracted JSONB,
  
  -- Document References
  document_hashes JSONB DEFAULT '[]',
  consent_timestamp TIMESTAMPTZ,
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Search Tracking (NEW)
  last_search_at TIMESTAMPTZ,
  search_count INTEGER DEFAULT 1,
  
  -- Manual Review
  manual_reviewer_id UUID,
  notes TEXT,
  
  -- Metadata
  source VARCHAR(20) DEFAULT 'automatic',
  verification_type VARCHAR(50),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bv_user_id ON business_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_bv_ico ON business_verifications(ico);
CREATE INDEX IF NOT EXISTS idx_bv_declared_ico ON business_verifications(declared_ico);
CREATE INDEX IF NOT EXISTS idx_bv_status ON business_verifications(status);
CREATE INDEX IF NOT EXISTS idx_bv_created_at ON business_verifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bv_last_search ON business_verifications(last_search_at DESC);
CREATE INDEX IF NOT EXISTS idx_bv_source ON business_verifications(source);

-- 2. Verification Audit Logs
CREATE TABLE IF NOT EXISTS verification_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID REFERENCES business_verifications(id) ON DELETE CASCADE,
  
  -- Event Details
  event_type VARCHAR(50) NOT NULL,
  actor_type VARCHAR(20) DEFAULT 'system',
  actor_id UUID,
  
  -- Action Details
  action VARCHAR(100),
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  
  -- Payload
  payload JSONB,
  changes JSONB,
  
  -- Evidence
  document_hashes JSONB,
  registry_responses JSONB,
  
  -- Security
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_verification_id ON verification_audit_logs(verification_id);
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON verification_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON verification_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON verification_audit_logs(actor_type, actor_id);

-- 3. Verification Queue
CREATE TABLE IF NOT EXISTS verification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID REFERENCES business_verifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  priority INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'retrying'
  )),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  checks_required JSONB DEFAULT '["ares", "rzp", "vies"]',
  checks_completed JSONB DEFAULT '[]',
  
  error_message TEXT,
  retry_at TIMESTAMPTZ,
  
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON verification_queue(status) WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_queue_scheduled ON verification_queue(scheduled_at) WHERE status = 'pending';

-- 4. Verification Cache
CREATE TABLE IF NOT EXISTS verification_cache (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  source VARCHAR(20) NOT NULL,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cache_expires ON verification_cache(expires_at) WHERE expires_at > NOW();

-- 5. Verification Templates
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
('request_docs', 'en', 'Business verification documents needed', 'Dear {{name}},

We couldn''t confirm your trade license from the uploaded documents. 

Please upload a clear scan of your živnostenský list with the registration number visible.

Best regards,
GlowUp3 Team'),
('rejected', 'en', 'Business verification unsuccessful', 'Dear {{name}},

We could not verify your business registration. This may be because:
- The IČO provided does not exist in public registries
- Your trade license status is not active

Please contact support with proof of your business registration.

Best regards,
GlowUp3 Team'),
('verified', 'en', 'Business verification complete', 'Dear {{name}},

Great news! Your business has been successfully verified.

Your company {{company_name}} (IČO: {{ico}}) is now verified on GlowUp3.

Best regards,
GlowUp3 Team')
ON CONFLICT DO NOTHING;

-- Disable RLS for admin operations (use in development)
ALTER TABLE business_verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_templates DISABLE ROW LEVEL SECURITY;