import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import { generateSQLQuery, validateSQL } from '@/lib/minimax';

// Create admin Supabase client with service role key
function createAdminClient() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ydnmhnutaitmbeybpwxc.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Log admin action
async function logAdminAction(adminId: string, action: string, details: Record<string, unknown>) {
  console.log(`[AI DB QUERY] ${new Date().toISOString()} | Admin: ${adminId} | Action: ${action} | Details:`, details);
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, execute = true } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Log the AI query request
    await logAdminAction(session.userId!, 'AI_QUERY_REQUEST', { query });

    // Generate SQL from natural language query
    const { sql, explanation, isSafe } = await generateSQLQuery(query);

    if (!isSafe) {
      await logAdminAction(session.userId!, 'AI_QUERY_REJECTED', { query, reason: explanation });
      return NextResponse.json({ 
        error: 'Query could not be safely converted to SQL',
        explanation 
      }, { status: 400 });
    }

    if (!sql) {
      return NextResponse.json({ 
        error: 'Failed to generate SQL query' 
      }, { status: 500 });
    }

    // Validate the generated SQL
    const validation = validateSQL(sql);
    if (!validation.isValid) {
      await logAdminAction(session.userId!, 'SQL_VALIDATION_FAILED', { sql, error: validation.error });
      return NextResponse.json({ 
        error: 'Generated SQL validation failed',
        details: validation.error
      }, { status: 400 });
    }

    // If execute is false, just return the generated SQL
    if (!execute) {
      await logAdminAction(session.userId!, 'SQL_PREVIEW', { sql });
      return NextResponse.json({
        sql,
        explanation,
        rows: [],
        rowCount: 0
      });
    }

    // Execute the query
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).single();

    // If RPC doesn't exist, use raw query via postgrest
    let result;
    if (error && error.message.includes('function') && error.message.includes('does not exist')) {
      // Fallback: Try to extract table name and use Supabase query
      const tableMatch = sql.match(/from\s+(\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const { data: tableData, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(100);
        
        if (tableError) {
          throw tableError;
        }
        result = { data: tableData, error: null };
      } else {
        throw error;
      }
    } else if (error) {
      throw error;
    } else {
      result = { data, error: null };
    }

    const rowsData = Array.isArray(result.data) ? result.data : (result.data ? [result.data] : []);
    
    await logAdminAction(session.userId!, 'SQL_EXECUTED', { 
      sql, 
      rowCount: rowsData.length 
    });

    return NextResponse.json({
      sql,
      explanation,
      rows: rowsData,
      rowCount: rowsData.length
    });

  } catch (err) {
    console.error('AI DB Query error:', err);
    
    // Handle specific errors
    if (err instanceof Error) {
      if (err.message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to execute query',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for suggested queries
export async function GET() {
  const suggestions = [
    { query: "Show all open support tickets", category: "tickets" },
    { query: "Show recent error logs", category: "logs" },
    { query: "Show pending transactions", category: "transactions" },
    { query: "Show active user flags", category: "users" },
    { query: "Show pending reports", category: "reports" },
    { query: "Show recent cancellations", category: "cancellations" },
    { query: "Show escrow transactions", category: "finance" },
    { query: "Show high priority tickets", category: "tickets" },
  ];

  return NextResponse.json({ suggestions });
}