'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import styles from './pros.module.css';

const pros = [
  { name: 'Anna K.', role: 'Hair Stylist', rating: 4.9, reviews: 127, price: '€45', distance: '0.8 km', available: true, tags: ['Haircut', 'Color', 'Styling'], icon: 'hair' },
  { name: 'Petr M.', role: 'Massage Therapist', rating: 4.8, reviews: 93, price: '€60', distance: '1.2 km', available: true, tags: ['Swedish', 'Deep Tissue', 'Sports'], icon: 'massage' },
  { name: 'Lucie H.', role: 'Makeup Artist', rating: 4.9, reviews: 156, price: '€55', distance: '2.1 km', available: false, tags: ['Bridal', 'Evening', 'Natural'], icon: 'makeup' },
  { name: 'Jana M.', role: 'Nail Technician', rating: 4.7, reviews: 84, price: '€35', distance: '1.5 km', available: true, tags: ['Gel', 'Acrylic', 'Art'], icon: 'nails' },
  { name: 'Tomáš K.', role: 'Personal Trainer', rating: 4.9, reviews: 201, price: '€50', distance: '3.0 km', available: true, tags: ['Strength', 'Cardio', 'Yoga'], icon: 'fitness' },
  { name: 'Eva N.', role: 'Facial Specialist', rating: 4.8, reviews: 112, price: '€65', distance: '2.5 km', available: false, tags: ['Classic', 'Anti-Aging', 'Organic'], icon: 'spa' },
  { name: 'Martin P.', role: 'Barber', rating: 4.6, reviews: 68, price: '€30', distance: '0.5 km', available: true, tags: ['Classic Cut', 'Beard', 'Hot Towel'], icon: 'barber' },
  { name: 'Kateřina S.', role: 'Lash Artist', rating: 4.9, reviews: 143, price: '€50', distance: '3.5 km', available: true, tags: ['Extensions', 'Lift', 'Tint'], icon: 'lash' },
];

const iconMap: Record<string, React.ReactNode> = {
  hair: <Icon name="hair" size={36} />,
  massage: <Icon name="massage" size={36} />,
  makeup: <Icon name="makeup" size={36} />,
  nails: <Icon name="nails" size={36} />,
  fitness: <Icon name="fitness" size={36} />,
  spa: <Icon name="spa" size={36} />,
  barber: <Icon name="barber" size={36} />,
  lash: <Icon name="lash" size={36} />,
};

export default function ProsPage() {
  const [search, setSearch] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);

  const filtered = pros.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.role.toLowerCase().includes(search.toLowerCase());
    const matchesAvailable = filterAvailable ? p.available : true;
    return matchesSearch && matchesAvailable;
  });

  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} />
      <section className={styles.hero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <h1 className={styles.title}>Browse Professionals</h1>
          <p className={styles.subtitle}>Find top-rated beauty and wellness professionals near you</p>
          <div className={styles.searchBar}>
            <Icon name="search" size={18} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name or service..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <label className={styles.availableToggle}>
              <input type="checkbox" checked={filterAvailable} onChange={e => setFilterAvailable(e.target.checked)} />
              <span>Available Now</span>
            </label>
          </div>
        </div>
      </section>

      <section className={styles.results}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {filtered.map((pro, i) => (
              <div key={i} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.proEmoji}>{iconMap[pro.icon]}</div>
                  {pro.available && <span className={styles.availableBadge}><Icon name="lightning" size={12} color="#34d399" /> Available</span>}
                </div>
                <h3 className={styles.proName}>{pro.name}</h3>
                <span className={styles.proRole}>{pro.role}</span>
                <div className={styles.proRating}>
                  <Icon name="star" size={14} color="#fbbf24" />
                  <span className={styles.ratingNum}>{pro.rating}</span>
                  <span className={styles.reviews}>({pro.reviews} reviews)</span>
                </div>
                <div className={styles.tags}>
                  {pro.tags.map((t, j) => <span key={j} className={styles.tag}>{t}</span>)}
                </div>
                <div className={styles.proFooter}>
                  <span className={styles.proPrice}>{pro.price}<span className={styles.perService}>/service</span></span>
                  <span className={styles.proDistance}><Icon name="location" size={12} /> {pro.distance}</span>
                </div>
                <a href="#" className={styles.bookBtn}>Book Now</a>
              </div>
            ))}
          </div>
          {filtered.length === 0 && <p className={styles.noResults}>No professionals found matching your search.</p>}
        </div>
      </section>
    </div>
  );
}