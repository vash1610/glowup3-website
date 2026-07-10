import { createClient } from '@supabase/supabase-js';

export function promotionsDb() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ydnmhnutaitmbeybpwxc.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Maps the real `promotions` table row (+ joined owner/type display data) to the
// flat shape the admin UI was built against, so the UI doesn't need a rewrite
// just because the underlying schema is richer (owner_type, promotion_type_id
// FK, daily vs total budget, etc.) than the UI's original mock data assumed.
export function formatPromotion(
  row: Record<string, any>,
  ownerName: string,
  typeCode: string
) {
  return {
    id: row.id,
    name: row.title,
    type: typeCode,
    status: row.status,
    owner_id: row.owner_id,
    owner_type: row.owner_type,
    owner_name: ownerName,
    budget: row.total_budget,
    daily_budget: row.daily_budget,
    spent: row.spent_amount,
    impressions: row.current_impressions,
    clicks: row.current_clicks,
    conversions: row.current_conversions,
    admin_approved: row.admin_approved,
    start_date: row.start_date,
    end_date: row.end_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function resolveOwnerNames(
  db: ReturnType<typeof promotionsDb>,
  owners: Array<{ owner_id: string; owner_type: string }>
): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  const customerIds = owners.filter((o) => o.owner_type === 'customer').map((o) => o.owner_id);
  const proIds = owners.filter((o) => o.owner_type === 'professional').map((o) => o.owner_id);

  const [{ data: customers }, { data: pros }] = await Promise.all([
    customerIds.length
      ? db.from('customers').select('id, display_name, first_name').in('id', customerIds)
      : Promise.resolve({ data: [] as any[] }),
    proIds.length
      ? db.from('professionals').select('id, display_name').in('id', proIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  (customers || []).forEach((c: any) => names.set(c.id, c.display_name || c.first_name || 'Unknown'));
  (pros || []).forEach((p: any) => names.set(p.id, p.display_name || 'Unknown'));

  return names;
}

export async function resolveTypeCodes(
  db: ReturnType<typeof promotionsDb>,
  typeIds: string[]
): Promise<Map<string, string>> {
  const codes = new Map<string, string>();
  if (typeIds.length === 0) return codes;

  const { data } = await db.from('promotion_types').select('id, type_code').in('id', typeIds);
  (data || []).forEach((t: any) => codes.set(t.id, t.type_code));
  return codes;
}
