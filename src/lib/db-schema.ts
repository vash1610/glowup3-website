// Reads real column metadata from PostgREST's OpenAPI description instead of
// hand-maintaining a column list per table (which drifts as the schema changes).
// Cached in-memory per warm serverless instance - schema changes are rare
// enough that a few minutes of staleness is fine for an admin data browser.

export interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
}

let cachedSpec: { definitions: Record<string, { properties?: Record<string, any>; required?: string[] }> } | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getSchemaSpec() {
  if (cachedSpec && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedSpec;
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ydnmhnutaitmbeybpwxc.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: 'application/openapi+json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch schema: ${response.status}`);
  }

  cachedSpec = await response.json();
  cachedAt = Date.now();
  return cachedSpec!;
}

export async function getTableColumns(tableName: string): Promise<ColumnInfo[]> {
  const spec = await getSchemaSpec();
  const def = spec.definitions?.[tableName];

  if (!def?.properties) {
    return [];
  }

  const required = new Set(def.required || []);

  return Object.entries(def.properties).map(([name, prop]) => ({
    column_name: name,
    data_type: prop.format || prop.type || 'unknown',
    is_nullable: !required.has(name),
    column_default: prop.default !== undefined ? String(prop.default) : null,
  }));
}

// Tables holding raw credentials/secrets stay out of the generic browser even
// though everything else is open to it - "full admin visibility" shouldn't
// include password hashes, session tokens, or bank account numbers.
export const BLOCKED_TABLES = new Set([
  'admin_credentials',
  'admin_sessions',
  'admin_verification_codes',
  'admin_login_attempts',
  'bank_accounts',
  'stripe_accounts',
  'rls_policy_backup',
]);

export async function listPublicTables(): Promise<string[]> {
  const spec = await getSchemaSpec();
  return Object.keys(spec.definitions || {})
    .filter((name) => !BLOCKED_TABLES.has(name))
    .sort();
}
