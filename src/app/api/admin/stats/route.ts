import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

function adminDb() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ydnmhnutaitmbeybpwxc.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const STATUS_BUCKET: Record<string, 'pending' | 'confirmed' | 'completed' | 'cancelled'> = {
  pending: 'pending',
  pending_payment: 'pending',
  confirmed: 'confirmed',
  confirmed_by_pro: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
  cancelled_by_customer: 'cancelled',
  cancelled_by_pro: 'cancelled',
};

export async function GET() {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = adminDb();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      { count: totalCustomers },
      { count: totalPros },
      { count: activePros },
      { count: appointmentsToday },
      { data: appointments },
      { data: activeFlags },
      { data: errorLogs },
      { data: recentCustomers },
      { data: recentPros },
    ] = await Promise.all([
      db.from('customers').select('*', { count: 'exact', head: true }),
      db.from('professionals').select('*', { count: 'exact', head: true }),
      db
        .from('professionals')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_locked', false),
      db.from('appointments').select('*', { count: 'exact', head: true }).eq('date', todayStr),
      db
        .from('appointments')
        .select('id, customer_name, pro_name, service_name, date, time, status, final_price, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false }),
      db
        .from('user_flags')
        .select('id, user_id, user_type, flag_type, severity, description, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10),
      db
        .from('error_logs')
        .select('id, error_code, error_priority, category, message, created_at')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(10),
      db
        .from('customers')
        .select('id, display_name, first_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      db
        .from('professionals')
        .select('id, display_name, category, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const allAppointments = appointments || [];

    // Revenue: completed appointments' final_price, already in CZK major units.
    let revenueMTD = 0;
    const revenueByDay = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      revenueByDay.set(d.toISOString().split('T')[0], 0);
    }

    const statusCounts: Record<'pending' | 'confirmed' | 'completed' | 'cancelled', number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const apt of allAppointments) {
      const bucket = STATUS_BUCKET[apt.status] || null;
      if (bucket) statusCounts[bucket]++;

      if (apt.status === 'completed' && apt.final_price) {
        const createdDate = new Date(apt.created_at);
        if (createdDate >= startOfMonth) {
          revenueMTD += apt.final_price;
        }
        const dayKey = apt.created_at.split('T')[0];
        if (revenueByDay.has(dayKey)) {
          revenueByDay.set(dayKey, (revenueByDay.get(dayKey) || 0) + apt.final_price);
        }
      }
    }

    const revenueData = Array.from(revenueByDay.entries()).map(([date, revenue]) => ({ date, revenue }));

    const recentAppointments = allAppointments.slice(0, 5).map((apt) => ({
      id: apt.id,
      customer: apt.customer_name || 'Unknown',
      professional: apt.pro_name || 'Unknown',
      service: apt.service_name || 'Service',
      date: `${apt.date} ${apt.time || ''}`.trim(),
      status: apt.status,
    }));

    const recentAlerts = [
      ...(activeFlags || []).map((f) => ({
        id: f.id,
        type: 'user' as const,
        title: `Flagged ${f.user_type}: ${f.flag_type}`,
        description: f.description || 'No description provided',
        severity: (f.severity === 'critical' || f.severity === 'high'
          ? 'high'
          : f.severity === 'low'
          ? 'low'
          : 'medium') as 'low' | 'medium' | 'high',
        timestamp: f.created_at,
      })),
      ...(errorLogs || []).map((e) => ({
        id: e.id,
        type: 'system' as const,
        title: e.category || 'Error',
        description: e.message || e.error_code || 'Unresolved error',
        severity: (e.error_priority === 'critical' || e.error_priority === 'high'
          ? 'high'
          : e.error_priority === 'low'
          ? 'low'
          : 'medium') as 'low' | 'medium' | 'high',
        timestamp: e.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    const recentActivity = [
      ...(recentCustomers || []).map((c) => ({
        id: `customer-${c.id}`,
        type: 'user' as const,
        title: 'New customer registered',
        description: c.display_name || c.first_name || 'New customer',
        timestamp: c.created_at,
      })),
      ...(recentPros || []).map((p) => ({
        id: `pro-${p.id}`,
        type: 'user' as const,
        title: 'New professional joined',
        description: `${p.display_name || 'New pro'}${p.category ? ` - ${p.category}` : ''}`,
        timestamp: p.created_at,
      })),
      ...allAppointments
        .filter((a) => a.status === 'completed')
        .slice(0, 5)
        .map((a) => ({
          id: `apt-${a.id}`,
          type: 'complete' as const,
          title: 'Appointment completed',
          description: `${a.customer_name || 'Customer'} - ${a.service_name || 'Service'}`,
          timestamp: a.created_at,
        })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map((item) => ({
        ...item,
        timestamp: formatRelativeTime(item.timestamp),
      }));

    return NextResponse.json({
      totalCustomers: totalCustomers || 0,
      totalPros: totalPros || 0,
      activePros: activePros || 0,
      appointmentsToday: appointmentsToday || 0,
      revenueMTD,
      revenueData,
      appointmentsByStatus: [
        { status: 'Pending', count: statusCounts.pending, color: '#f59e0b' },
        { status: 'Confirmed', count: statusCounts.confirmed, color: '#3b82f6' },
        { status: 'Completed', count: statusCounts.completed, color: '#10b981' },
        { status: 'Cancelled', count: statusCounts.cancelled, color: '#ef4444' },
      ],
      recentAppointments,
      recentAlerts: recentAlerts.map((a) => ({ ...a, timestamp: formatRelativeTime(a.timestamp) })),
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}
