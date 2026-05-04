import { NextRequest } from 'next/server';
import { rateLimit, sanitizeInput, secureResponse, getCorsHeaders } from '@/lib/security';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  // Apply rate limiting
  const rateLimitResult = rateLimit(ip);
  if (!rateLimitResult.success) {
    return secureResponse(
      { error: 'Too many requests. Please try again later.' },
      429
    );
  }

  try {
    // Fetch professionals with their ratings
    const { data: professionals, error } = await supabase
      .from('professionals')
      .select(`
        id,
        full_name,
        bio,
        profile_image_url,
        average_rating,
        services,
        is_available_now
      `)
      .eq('is_active', true)
      .order('average_rating', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching professionals:', error);
      return secureResponse({ error: 'Failed to fetch professionals' }, 500);
    }

    return secureResponse({
      professionals,
      remaining: rateLimitResult.remaining,
    });
  } catch (err) {
    console.error('Server error:', err);
    return secureResponse({ error: 'Internal server error' }, 500);
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}
