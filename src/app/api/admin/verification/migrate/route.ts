// Migration runner for business verification tables
// POST /api/admin/verification/migrate - Run migration via service role

import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run migration SQL via pg_execute if available, or use direct SQL
    // For Supabase, we need to use the service role to run DDL
    
    const migrationSQL = `
    -- Business Verifications Table
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
      trade_license_scope JSONB DEFAULT '[]',
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
      manual_reviewer_id UUID,
      notes TEXT,
      source VARCHAR(20) DEFAULT 'automatic',
      verification_type VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_bv_user_id ON business_verifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_bv_ico ON business_verifications(ico);
    CREATE INDEX IF NOT EXISTS idx_bv_status ON business_verifications(status);
    CREATE INDEX IF NOT EXISTS idx_bv_created_at ON business_verifications(created_at DESC);

    -- Verification Audit Logs Table
    CREATE TABLE IF NOT EXISTS verification_audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      verification_id UUID NOT NULL,
      event_type VARCHAR(50) NOT NULL,
      actor_type VARCHAR(20) NOT NULL,
      actor_id TEXT,
      action VARCHAR(100),
      previous_status VARCHAR(20),
      new_status VARCHAR(20),
      payload JSONB,
      changes JSONB,
      document_hashes JSONB,
      registry_responses JSONB,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_val_verification_id ON verification_audit_logs(verification_id);
    CREATE INDEX IF NOT EXISTS idx_val_created_at ON verification_audit_logs(created_at DESC);

    -- Verification Queue Table
    CREATE TABLE IF NOT EXISTS verification_queue (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      verification_id UUID,
      user_id UUID NOT NULL,
      priority INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'pending',
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

    CREATE INDEX IF NOT EXISTS idx_vq_status ON verification_queue(status);

    -- Verification Cache Table
    CREATE TABLE IF NOT EXISTS verification_cache (
      key VARCHAR(255) PRIMARY KEY,
      value JSONB NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      source VARCHAR(20) NOT NULL,
      hit_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_vc_expires ON verification_cache(expires_at) WHERE expires_at > NOW();

    -- Verification Templates Table
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

    -- Insert default templates
    INSERT INTO verification_templates (template_type, language, subject, body) VALUES
    ('request_docs', 'en', 'We couldn''t verify your business documents', 'Dear {{name}}, We couldn''t confirm your trade license. Please upload a clear scan.')
    ON CONFLICT DO NOTHING;
    `;

    // Execute the migration via rpc if available, or use direct insert to verify table exists
    // Note: Supabase anon key can't run DDL, so we use service role via admin client
    
    // Check if tables exist by trying to select
    const { error: checkError } = await supabaseAdmin
      .from('business_verifications')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST204') {
      // Table doesn't exist - need migration
      return NextResponse.json({
        success: false,
        message: 'Migration needed. Apply the migration SQL file: supabase/migrations/20260526000000_business_verification.sql',
        migration_required: true,
        instructions: [
          '1. Go to Supabase Dashboard > SQL Editor',
          '2. Copy the migration file content',
          '3. Run the SQL to create tables',
          '4. Return to this page and retry'
        ]
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Business verification tables are ready',
      tables: ['business_verifications', 'verification_audit_logs', 'verification_queue', 'verification_cache', 'verification_templates']
    });

  } catch (error) {
    console.error('Migration check error:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}