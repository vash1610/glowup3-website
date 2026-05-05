'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './pros.module.css';

const pros = [
  { name: 'Anna K.', role: 'Hair Stylist', rating: 4.9, reviews: 127, price: '€45', distance: '0.8 km', available: true, tags: ['Haircut', 'Color', 'Styling'], emoji: '💇' },
  { name: 'Petr M.', role: 'Massage Therapist', rating: 4.8, reviews: 93, price: '€60', distance: '1.2 km', available: true, tags: ['Swedish', 'Deep Tissue', 'Sports'], emoji: '💆' },
  { name: 'Lucie H.', role: 'Makeup Artist', rating: 4.9, reviews: 156, price: '€55', distance: '2.1 km', available: false, tags: ['Bridal', 'Evening', 'Natural'], emoji: '💄' },
  { name: 'Jana M.', role: 'Nail Technician', rating: 4.7, reviews: 84, price: '€35', distance: '1.5 km', available: true, tags: ['Gel', 'Acrylic', 'Art'], emoji: '💅' },
  { name: 'Tomáš K.', role: 'Personal Trainer', rating: 4.9, reviews: 201, price: '€50', distance: '3.0 km', available: true, tags: ['Strength', 'Cardio', 'Yoga'], emoji: '💪' },
  { name: 'Eva N.', role: 'Facial Specialist', rating: 4.8, reviews: 112, price: '€65', distance: '2.5 km', available: false, tags: ['Classic', 'Anti-Aging', 'Organic'], emoji: '🧖' },
  { name: 'Martin P.', role: 'Barber', rating: 4.6, reviews: 68, price: '€30', distance: '0.5 km', available: true, tags: ['Classic Cut', 'Beard', 'Hot Towel'], emoji: '✂️' },
  { name: 'Kateřina S.', role: 'Lash Artist', rating: 4.9, reviews: 143, price: '€50', distance: '3.5 km', available: true, tags: ['Extensions', 'Lift', 'Tint'], emoji: '👁️' },
];

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
            <span className={styles.searchIcon}>🔍</span>
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
                  <div className={styles.proEmoji}>{pro.emoji}</div>
                  {pro.available && <span className={styles.availableBadge}>⚡ Available</span>}
                </div>
                <h3 className={styles.proName}>{pro.name}</h3>
                <span className={styles.proRole}>{pro.role}</span>
                <div className={styles.proRating}>
                  <span className={styles.stars}>{'★'.repeat(Math.floor(pro.rating))}</span>
                  <span className={styles.ratingNum}>{pro.rating}</span>
                  <span className={styles.reviews}>({pro.reviews} reviews)</span>
                </div>
                <div className={styles.tags}>
                  {pro.tags.map((t, j) => <span key={j} className={styles.tag}>{t}</span>)}
                </div>
                <div className={styles.proFooter}>
                  <span className={styles.proPrice}>{pro.price}<span className={styles.perService}>/service</span></span>
                  <span className={styles.proDistance}>📍 {pro.distance}</span>
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