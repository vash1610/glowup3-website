import { NextResponse } from 'next/server';

const reviews = [
  { id: 1, author: 'Martina K.', rating: 5, text: 'Todayly transformed my business. The Available Now feature brings me customers even during slow days.', service: 'Hair Styling', date: '2026-04-28' },
  { id: 2, author: 'Petr S.', rating: 5, text: "The wallet system and escrow give me peace of mind. I know I'll get paid for my work.", service: 'Personal Training', date: '2026-04-25' },
  { id: 3, author: 'Lucie M.', rating: 5, text: 'Gift cards are perfect! I gifted my mom a spa day and she loved the beautiful card design.', service: 'Spa', date: '2026-04-20' },
  { id: 4, author: 'Jan N.', rating: 4, text: 'Great platform. Easy to book and the chat feature is really convenient.', service: 'Massage', date: '2026-04-18' },
  { id: 5, author: 'Eva H.', rating: 5, text: 'Found my favorite hair stylist on Todayly. Never going anywhere else!', service: 'Hair Styling', date: '2026-04-15' },
];

export async function GET() {
  return NextResponse.json({ data: reviews, total: reviews.length, averageRating: 4.8 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const newReview = { id: reviews.length + 1, ...body, date: new Date().toISOString().split('T')[0] };
  return NextResponse.json({ data: newReview, message: 'Review submitted successfully' }, { status: 201 });
}