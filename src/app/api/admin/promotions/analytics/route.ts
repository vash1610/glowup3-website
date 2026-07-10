import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';

// Types
interface AnalyticsSummary {
  total_promotions: number;
  active_promotions: number;
  total_revenue: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  average_ctr: number;
  average_conversion_rate: number;
  by_type: {
    type: string;
    count: number;
    revenue: number;
    impressions: number;
    clicks: number;
    conversions: number;
  }[];
  by_status: {
    status: string;
    count: number;
    revenue: number;
  }[];
  top_performers: {
    promotion_id: string;
    promotion_name: string;
    owner_name: string;
    conversions: number;
    revenue: number;
  }[];
}

// Mock analytics data
const mockAnalytics: AnalyticsSummary = {
  total_promotions: 156,
  active_promotions: 42,
  total_revenue: 48750.00,
  total_impressions: 1250000,
  total_clicks: 87500,
  total_conversions: 3250,
  average_ctr: 7.0,
  average_conversion_rate: 3.71,
  by_type: [
    {
      type: 'featured',
      count: 65,
      revenue: 19500.00,
      impressions: 520000,
      clicks: 36400,
      conversions: 1375,
    },
    {
      type: 'spotlight',
      count: 45,
      revenue: 16250.00,
      impressions: 400000,
      clicks: 28000,
      conversions: 980,
    },
    {
      type: 'premium',
      count: 28,
      revenue: 9800.00,
      impressions: 220000,
      clicks: 15400,
      conversions: 620,
    },
    {
      type: 'badge',
      count: 18,
      revenue: 3200.00,
      impressions: 110000,
      clicks: 7700,
      conversions: 275,
    },
  ],
  by_status: [
    { status: 'active', count: 42, revenue: 18500.00 },
    { status: 'paused', count: 15, revenue: 5200.00 },
    { status: 'completed', count: 89, revenue: 22500.00 },
    { status: 'pending', count: 10, revenue: 2500.00 },
  ],
  top_performers: [
    {
      promotion_id: '1',
      promotion_name: 'Premium Spotlight - Sarah Johnson',
      owner_name: 'Sarah Johnson',
      conversions: 156,
      revenue: 750.00,
    },
    {
      promotion_id: '2',
      promotion_name: 'Featured Pro - Michael Chen',
      owner_name: 'Michael Chen',
      conversions: 142,
      revenue: 680.00,
    },
    {
      promotion_id: '3',
      promotion_name: 'Spotlight Premium - Emily Davis',
      owner_name: 'Emily Davis',
      conversions: 128,
      revenue: 625.00,
    },
  ],
};

// Generate daily data for date range
function generateDailyData(startDate: string, endDate: string, ownerId?: string) {
  const dailyData = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dailyData.push({
      date: d.toISOString().split('T')[0],
      impressions: Math.floor(Math.random() * 5000) + 1000,
      clicks: Math.floor(Math.random() * 400) + 100,
      conversions: Math.floor(Math.random() * 25) + 5,
      revenue: Math.round((Math.random() * 100 + 20) * 100) / 100,
    });
  }
  
  return dailyData;
}

// GET: Fetch analytics summary (total revenue, impressions, etc.)
// Query params: date_from, date_to, owner_id
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    const owner_id = searchParams.get('owner_id');
    
    // If date range provided, generate daily breakdown
    let daily_breakdown = null;
    if (date_from && date_to) {
      daily_breakdown = generateDailyData(date_from, date_to, owner_id || undefined);
    }
    
    // Filter by owner_id if provided (mock filtering)
    let filteredAnalytics = { ...mockAnalytics };
    
    if (owner_id) {
      // Simulate owner-specific data
      filteredAnalytics = {
        ...mockAnalytics,
        total_promotions: Math.floor(mockAnalytics.total_promotions * 0.15),
        active_promotions: Math.floor(mockAnalytics.active_promotions * 0.2),
        total_revenue: mockAnalytics.total_revenue * 0.18,
        total_impressions: Math.floor(mockAnalytics.total_impressions * 0.15),
        total_clicks: Math.floor(mockAnalytics.total_clicks * 0.15),
        total_conversions: Math.floor(mockAnalytics.total_conversions * 0.15),
        top_performers: mockAnalytics.top_performers.slice(0, 2),
      };
    }
    
    return NextResponse.json({
      success: true,
      data: filteredAnalytics,
      filters: {
        date_from,
        date_to,
        owner_id,
      },
      daily_breakdown,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
