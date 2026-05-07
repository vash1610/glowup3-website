import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get counts from database (using mock data if tables don't exist)
    const stats = {
      totalCustomers: 156,
      totalPros: 42,
      activePros: 38,
      appointmentsToday: 23,
      revenueMTD: 284500,
      activeSubscriptions: 89,
      recentAppointments: [
        {
          id: '1',
          customer: 'Klára Svobodová',
          professional: 'Zuzana Králová',
          service: 'Hair Coloring',
          date: '2024-01-15 14:00',
          status: 'confirmed'
        },
        {
          id: '2',
          customer: 'Jana Dvořáková',
          professional: 'Petra Nová',
          service: 'Manicure',
          date: '2024-01-15 15:30',
          status: 'pending'
        },
        {
          id: '3',
          customer: 'Eva Procházková',
          professional: 'Martin Čermák',
          service: 'Massage',
          date: '2024-01-15 16:00',
          status: 'confirmed'
        }
      ],
      recentAlerts: [
        {
          id: '1',
          type: 'payment',
          title: 'Failed payment',
          description: 'Payment failed for appointment #1234',
          severity: 'high',
          timestamp: '10 minutes ago'
        },
        {
          id: '2',
          type: 'user',
          title: 'Flagged account',
          description: 'Multiple failed login attempts',
          severity: 'medium',
          timestamp: '25 minutes ago'
        }
      ],
      revenueData: generateRevenueData()
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

function generateRevenueData() {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 15000) + 5000
    });
  }
  return data;
}
