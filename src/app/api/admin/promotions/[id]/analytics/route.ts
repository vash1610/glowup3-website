import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';

// Types
interface PromotionDailyAnalytics {
  promotion_id: string;
  promotion_name: string;
  owner_id: string;
  owner_name: string;
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_impressions: number;
    total_clicks: number;
    total_conversions: number;
    total_revenue: number;
    ctr: number;
    conversion_rate: number;
    average_cpc: number;
  };
  daily: {
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    budget_remaining: number;
  }[];
}

// Mock promotion data
const mockPromotions: Record<string, { name: string; owner_id: string; owner_name: string; budget: number; spent: number; start_date: string; end_date: string }> = {
  '1': {
    name: 'Premium Spotlight - Sarah Johnson',
    owner_id: 'user_1',
    owner_name: 'Sarah Johnson',
    budget: 500.00,
    spent: 245.50,
    start_date: '2025-06-01',
    end_date: '2025-06-30',
  },
  '2': {
    name: 'Featured Pro - Michael Chen',
    owner_id: 'user_2',
    owner_name: 'Michael Chen',
    budget: 750.00,
    spent: 680.25,
    start_date: '2025-06-05',
    end_date: '2025-06-25',
  },
  '3': {
    name: 'Badge Premium - Emma Wilson',
    owner_id: 'user_3',
    owner_name: 'Emma Wilson',
    budget: 300.00,
    spent: 120.00,
    start_date: '2025-06-10',
    end_date: '2025-07-10',
  },
  '4': {
    name: 'Spotlight Pro - David Brown',
    owner_id: 'user_4',
    owner_name: 'David Brown',
    budget: 400.00,
    spent: 400.00,
    start_date: '2025-05-15',
    end_date: '2025-06-15',
  },
  '5': {
    name: 'Premium Listing - Lisa Anderson',
    owner_id: 'user_5',
    owner_name: 'Lisa Anderson',
    budget: 1000.00,
    spent: 0,
    start_date: '2025-06-20',
    end_date: '2025-07-20',
  },
};

// Generate daily analytics for a promotion
function generatePromotionDailyAnalytics(promotionId: string, startDate: string, endDate: string) {
  const daily = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  let cumulativeImpressions = 0;
  let cumulativeClicks = 0;
  let cumulativeConversions = 0;
  let cumulativeRevenue = 0;
  let budgetRemaining = mockPromotions[promotionId]?.budget || 0;
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dailyImpressions = Math.floor(Math.random() * 500) + 100;
    const dailyClicks = Math.floor(dailyImpressions * (Math.random() * 0.1 + 0.03));
    const dailyConversions = Math.floor(dailyClicks * (Math.random() * 0.08 + 0.02));
    const dailyRevenue = Math.round((dailyConversions * (Math.random() * 10 + 5)) * 100) / 100;
    
    cumulativeImpressions += dailyImpressions;
    cumulativeClicks += dailyClicks;
    cumulativeConversions += dailyConversions;
    cumulativeRevenue += dailyRevenue;
    budgetRemaining -= dailyRevenue;
    
    daily.push({
      date: d.toISOString().split('T')[0],
      impressions: dailyImpressions,
      clicks: dailyClicks,
      conversions: dailyConversions,
      revenue: dailyRevenue,
      budget_remaining: Math.max(0, Math.round(budgetRemaining * 100) / 100),
    });
  }
  
  return daily;
}

// GET: Fetch daily analytics for a specific promotion
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');
    
    const promotion = mockPromotions[id];
    
    if (!promotion) {
      return NextResponse.json(
        { success: false, error: 'Promotion not found' },
        { status: 404 }
      );
    }
    
    const startDate = date_from || promotion.start_date;
    const endDate = date_to || promotion.end_date;
    const daily = generatePromotionDailyAnalytics(id, startDate, endDate);
    
    // Calculate summary
    const totalImpressions = daily.reduce((sum, d) => sum + d.impressions, 0);
    const totalClicks = daily.reduce((sum, d) => sum + d.clicks, 0);
    const totalConversions = daily.reduce((sum, d) => sum + d.conversions, 0);
    const totalRevenue = Math.round(daily.reduce((sum, d) => sum + d.revenue, 0) * 100) / 100;
    
    const analytics: PromotionDailyAnalytics = {
      promotion_id: id,
      promotion_name: promotion.name,
      owner_id: promotion.owner_id,
      owner_name: promotion.owner_name,
      period: {
        start_date: startDate,
        end_date: endDate,
      },
      summary: {
        total_impressions: totalImpressions,
        total_clicks: totalClicks,
        total_conversions: totalConversions,
        total_revenue: totalRevenue,
        ctr: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0,
        conversion_rate: totalClicks > 0 ? Math.round((totalConversions / totalClicks) * 10000) / 100 : 0,
        average_cpc: totalClicks > 0 ? Math.round((totalRevenue / totalClicks) * 100) / 100 : 0,
      },
      daily,
    };
    
    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error fetching promotion analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
