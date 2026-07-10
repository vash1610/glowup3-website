import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

function adminDb() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ydnmhnutaitmbeybpwxc.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET() {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = adminDb();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      { data: newCustomers },
      { data: newPros },
      { data: pageViews },
      { data: activeFlags },
      { count: totalCustomers },
      { count: totalPros },
    ] = await Promise.all([
      db.from('customers').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()),
      db.from('professionals').select('created_at').gte('created_at', thirtyDaysAgo.toISOString()),
      db
        .from('page_views')
        .select('screen_name, session_id, duration_seconds, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString()),
      db.from('user_flags').select('user_type').eq('is_active', true),
      db.from('customers').select('*', { count: 'exact', head: true }),
      db.from('professionals').select('*', { count: 'exact', head: true }),
    ]);

    // Registration growth: signups per day, both roles.
    const growthByDay = new Map<string, { customers: number; professionals: number }>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      growthByDay.set(d.toISOString().split('T')[0], { customers: 0, professionals: 0 });
    }
    (newCustomers || []).forEach((c) => {
      const day = c.created_at.split('T')[0];
      const entry = growthByDay.get(day);
      if (entry) entry.customers++;
    });
    (newPros || []).forEach((p) => {
      const day = p.created_at.split('T')[0];
      const entry = growthByDay.get(day);
      if (entry) entry.professionals++;
    });

    const registrationGrowth = Array.from(growthByDay.entries()).map(([date, counts]) => ({
      date,
      customers: counts.customers,
      professionals: counts.professionals,
      total: counts.customers + counts.professionals,
    }));

    // Engagement: which screens get used, from real page_views rows (empty
    // until the instrumented mobile app build reaches users - that's expected,
    // not a bug).
    const screenCounts = new Map<string, number>();
    const sessionIds = new Set<string>();
    let totalDurationSeconds = 0;
    let durationSamples = 0;

    (pageViews || []).forEach((pv) => {
      const screen = pv.screen_name || 'Unknown';
      screenCounts.set(screen, (screenCounts.get(screen) || 0) + 1);
      if (pv.session_id) sessionIds.add(pv.session_id);
      if (pv.duration_seconds) {
        totalDurationSeconds += pv.duration_seconds;
        durationSamples++;
      }
    });

    const topScreens = Array.from(screenCounts.entries())
      .map(([screen_name, views]) => ({ screen_name, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Flagged users, by role.
    const flaggedByType = { customer: 0, professional: 0 };
    (activeFlags || []).forEach((f) => {
      if (f.user_type === 'customer') flaggedByType.customer++;
      else if (f.user_type === 'professional') flaggedByType.professional++;
    });

    return NextResponse.json({
      registrationGrowth,
      totals: {
        totalCustomers: totalCustomers || 0,
        totalPros: totalPros || 0,
        newCustomersLast30d: (newCustomers || []).length,
        newProsLast30d: (newPros || []).length,
      },
      engagement: {
        totalPageViews: (pageViews || []).length,
        uniqueSessions: sessionIds.size,
        avgDurationSeconds: durationSamples > 0 ? Math.round(totalDurationSeconds / durationSamples) : 0,
        topScreens,
        hasData: (pageViews || []).length > 0,
      },
      flaggedUsers: {
        total: (activeFlags || []).length,
        customers: flaggedByType.customer,
        professionals: flaggedByType.professional,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
