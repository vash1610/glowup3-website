/**
 * MiniMax API Client for AI-powered database queries
 * Uses MiniMax M2.7 model
 */

const MINIMAX_API_URL = process.env.MINIMAX_API_URL || 'https://api.minimax.chat/v1';
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;

export interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MiniMaxResponse {
  id: string;
  choices: Array<{
    finish_reason: string;
    index: number;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Database schema context for the AI
const DATABASE_SCHEMA = `
Database Schema for Todayly Platform:

Tables:
1. error_logs - id, error_code, error_type, message, stack_trace, severity, user_id, user_type, endpoint, method, request_body, response_status, metadata, occurred_at, resolved_at, resolved_by, created_at

2. user_flags - id, user_id, user_type, flag_type, severity, description, evidence, flagged_by, is_active, resolved_at, resolved_by, resolution_notes, created_at, updated_at

3. support_tickets - id, ticket_number, user_id, user_type, subject, description, category, priority, status, assigned_to, messages, attachments, customer_rating, customer_feedback, created_at, updated_at, resolved_at, closed_at, message_count

4. ticket_messages - id, ticket_id, sender_id, sender_type, content, is_read, created_at, updated_at

5. admin_credentials - id, email, passkey_hash, totp_secret, is_totp_enabled, is_active, last_login_at, login_count, created_at, updated_at

6. admin_sessions - id, admin_id, session_token, ip_address, user_agent, expires_at, created_at

7. admin_verification_codes - id, admin_id, code_hash, code_type, expires_at, attempts, used, created_at

8. reports - id, reporter_id, reporter_type, reported_user_id, reported_user_type, report_type, description, evidence, status, assigned_to, resolution_notes, created_at, updated_at, resolved_at

9. transaction_log - id, transaction_type, amount_czk, balance_before, balance_after, user_id, user_type, reference_id, reference_type, stripe_payment_intent_id, stripe_transfer_id, status, metadata, processed_at, created_at

10. stripe_events - id, event_id, event_type, api_version, created, data, livemode, pending_webhooks, request, processed, processed_at, error_message, retry_count, created_at

11. escrow_transactions - id, appointment_id, customer_id, pro_id, amount_czk, status, released_amount, released_at, refunded_amount, refunded_at, stripe_payment_intent_id, created_at, updated_at

12. page_views - id, user_id, user_type, session_id, screen_name, route_path, duration_seconds, referrer, device_type, os_version, app_version, timestamp

13. service_usage_stats - id, pro_id, service_id, service_name, category, booking_count, revenue_czk, avg_rating, period_start, period_end, created_at, updated_at

14. cancellation_logs - id, appointment_id, cancelled_by_id, cancelled_by_type, cancellation_type, reason, reservation_fee_refunded, refund_amount, penalty_applied, penalty_amount, pro_notified, customer_notified, created_at

Common columns: id (UUID), created_at, updated_at
`;

// System prompt for SQL generation
const SYSTEM_PROMPT = `You are an AI assistant that converts natural language queries about a database into SQL SELECT statements.

CRITICAL RULES:
1. ONLY generate SELECT queries - NEVER generate INSERT, UPDATE, DELETE, DROP, or ALTER statements
2. Always use table names from the provided schema exactly as shown
3. Always include LIMIT clause (max 1000 rows) to prevent excessive queries
4. Use proper SQL syntax for PostgreSQL
5. Include ORDER BY when sorting is mentioned
6. Use appropriate WHERE clauses based on the query intent

Output format:
- First line: The generated SQL query
- Second line: Brief explanation of what the query does

If the query cannot be safely converted, respond with "UNSAFE: [reason]" and explain why.

Database schema:
${DATABASE_SCHEMA}`;

export async function generateSQLQuery(naturalLanguageQuery: string): Promise<{
  sql: string;
  explanation: string;
  isSafe: boolean;
}> {
  if (!MINIMAX_API_KEY) {
    // Fallback for development without API key
    return generateFallbackSQL(naturalLanguageQuery);
  }

  try {
    const response = await fetch(`${MINIMAX_API_URL}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: naturalLanguageQuery },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`MiniMax API error: ${response.status}`);
    }

    const data: MiniMaxResponse = await response.json();
    const content = data.choices[0]?.message?.content || '';

    return parseAIResponse(content);
  } catch (error) {
    console.error('MiniMax API error:', error);
    return {
      sql: '',
      explanation: 'Failed to generate SQL query',
      isSafe: false,
    };
  }
}

function parseAIResponse(content: string): { sql: string; explanation: string; isSafe: boolean } {
  const lines = content.split('\n').filter(line => line.trim());
  
  if (content.startsWith('UNSAFE:')) {
    return {
      sql: '',
      explanation: content,
      isSafe: false,
    };
  }

  const sqlLine = lines.find(line => line.toLowerCase().startsWith('select'));
  const sql = sqlLine || lines[0] || '';
  const explanation = lines.slice(1).join(' ') || 'Query generated';

  return {
    sql: sql.trim(),
    explanation: explanation.trim(),
    isSafe: sql.toLowerCase().startsWith('select'),
  };
}

// Fallback SQL generator for development without API key
function generateFallbackSQL(query: string): { sql: string; explanation: string; isSafe: boolean } {
  const lowerQuery = query.toLowerCase();

  // Support tickets queries
  if (lowerQuery.includes('ticket') && lowerQuery.includes('open')) {
    return {
      sql: "SELECT * FROM support_tickets WHERE status = 'open' ORDER BY created_at DESC LIMIT 100",
      explanation: "Returns all open support tickets, newest first",
      isSafe: true,
    };
  }
  
  if (lowerQuery.includes('ticket') && lowerQuery.includes('recent') || lowerQuery.includes('latest')) {
    return {
      sql: "SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 50",
      explanation: "Returns the 50 most recent support tickets",
      isSafe: true,
    };
  }

  if (lowerQuery.includes('ticket') && lowerQuery.includes('high') || lowerQuery.includes('priority')) {
    return {
      sql: "SELECT * FROM support_tickets WHERE priority = 'high' ORDER BY created_at DESC LIMIT 100",
      explanation: "Returns all high priority support tickets",
      isSafe: true,
    };
  }

  // User flags queries
  if (lowerQuery.includes('flag') && lowerQuery.includes('user')) {
    return {
      sql: "SELECT * FROM user_flags WHERE is_active = true ORDER BY created_at DESC LIMIT 100",
      explanation: "Returns all active user flags",
      isSafe: true,
    };
  }

  // Transaction queries
  if (lowerQuery.includes('transaction') && lowerQuery.includes('recent')) {
    return {
      sql: "SELECT * FROM transaction_log ORDER BY created_at DESC LIMIT 100",
      explanation: "Returns the 100 most recent transactions",
      isSafe: true,
    };
  }

  if (lowerQuery.includes('transaction') && lowerQuery.includes('pending')) {
    return {
      sql: "SELECT * FROM transaction_log WHERE status = 'pending' ORDER BY created_at DESC LIMIT 100",
      explanation: "Returns all pending transactions",
      isSafe: true,
    };
  }

  // Escrow queries
  if (lowerQuery.includes('escrow')) {
    return {
      sql: "SELECT * FROM escrow_transactions ORDER BY created_at DESC LIMIT 100",
      explanation: "Returns escrow transactions",
      isSafe: true,
    };
  }

  // Error logs
  if (lowerQuery.includes('error') || lowerQuery.includes('logs')) {
    return {
      sql: "SELECT * FROM error_logs ORDER BY occurred_at DESC LIMIT 100",
      explanation: "Returns recent error logs",
      isSafe: true,
    };
  }

  // Reports
  if (lowerQuery.includes('report')) {
    return {
      sql: "SELECT * FROM reports WHERE status = 'pending' ORDER BY created_at DESC LIMIT 100",
      explanation: "Returns pending reports",
      isSafe: true,
    };
  }

  // Cancellations
  if (lowerQuery.includes('cancel')) {
    return {
      sql: "SELECT * FROM cancellation_logs ORDER BY created_at DESC LIMIT 100",
      explanation: "Returns cancellation logs",
      isSafe: true,
    };
  }

  // Default - return recent tickets
  return {
    sql: "SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 50",
    explanation: "Returns recent support tickets (default query)",
    isSafe: true,
  };
}

export function validateSQL(sql: string): { isValid: boolean; error?: string } {
  const trimmed = sql.trim().toLowerCase();
  
  // Only SELECT queries allowed
  if (!trimmed.startsWith('select')) {
    return { isValid: false, error: 'Only SELECT queries are allowed' };
  }

  // Block dangerous keywords
  const dangerousKeywords = [
    'insert', 'update', 'delete', 'drop', 'truncate',
    'alter', 'create', 'grant', 'revoke', 'exec', 'execute'
  ];

  for (const keyword of dangerousKeywords) {
    if (trimmed.includes(keyword)) {
      return { isValid: false, error: `Keyword "${keyword}" is not allowed` };
    }
  }

  // Must have LIMIT
  if (!trimmed.includes('limit')) {
    return { isValid: false, error: 'Query must include LIMIT clause' };
  }

  return { isValid: true };
}