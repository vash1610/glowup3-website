import { NextResponse } from 'next/server';

const professionals = [
  { id: 1, name: 'Anna K.', role: 'Hair Stylist', rating: 4.9, reviews: 127, price: 45, distance: '0.8 km', available: true, tags: ['Haircut', 'Color', 'Styling'], emoji: '💇' },
  { id: 2, name: 'Petr M.', role: 'Massage Therapist', rating: 4.8, reviews: 93, price: 60, distance: '1.2 km', available: true, tags: ['Swedish', 'Deep Tissue', 'Sports'], emoji: '💆' },
  { id: 3, name: 'Lucie H.', role: 'Makeup Artist', rating: 4.9, reviews: 156, price: 55, distance: '2.1 km', available: false, tags: ['Bridal', 'Evening', 'Natural'], emoji: '💄' },
  { id: 4, name: 'Jana M.', role: 'Nail Technician', rating: 4.7, reviews: 84, price: 35, distance: '1.5 km', available: true, tags: ['Gel', 'Acrylic', 'Art'], emoji: '💅' },
  { id: 5, name: 'Tomáš K.', role: 'Personal Trainer', rating: 4.9, reviews: 201, price: 50, distance: '3.0 km', available: true, tags: ['Strength', 'Cardio', 'Yoga'], emoji: '💪' },
  { id: 6, name: 'Eva N.', role: 'Facial Specialist', rating: 4.8, reviews: 112, price: 65, distance: '2.5 km', available: false, tags: ['Classic', 'Anti-Aging', 'Organic'], emoji: '🧖' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const available = searchParams.get('available');
  const search = searchParams.get('search');

  let filtered = [...professionals];

  if (available === 'true') {
    filtered = filtered.filter(p => p.available);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q));
  }

  return NextResponse.json({ data: filtered, total: filtered.length });
}