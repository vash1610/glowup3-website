import { NextResponse } from 'next/server';

const bookings = [
  { id: 1, client: 'Marie P.', service: 'Haircut & Style', date: '2026-05-05T14:00:00', status: 'confirmed', amount: 55 },
  { id: 2, client: 'Jan N.', service: 'Beard Trim', date: '2026-05-05T16:30:00', status: 'confirmed', amount: 25 },
  { id: 3, client: 'Klára V.', service: 'Full Color', date: '2026-05-06T10:00:00', status: 'pending', amount: 85 },
  { id: 4, client: 'Tomáš R.', service: 'Haircut', date: '2026-05-06T15:00:00', status: 'confirmed', amount: 35 },
  { id: 5, client: 'Eva M.', service: 'Massage', date: '2026-05-07T11:00:00', status: 'cancelled', amount: 60 },
];

export async function GET() {
  return NextResponse.json({ data: bookings, total: bookings.length });
}

export async function POST(request: Request) {
  const body = await request.json();
  const newBooking = { id: bookings.length + 1, ...body, status: 'pending' };
  return NextResponse.json({ data: newBooking, message: 'Booking created successfully' }, { status: 201 });
}