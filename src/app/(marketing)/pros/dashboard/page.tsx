'use client';

import Link from 'next/link';
import styles from './dashboard.module.css';

const stats = [
  { label: 'Total Bookings', value: '47', change: '+12%', icon: '📅' },
  { label: 'Revenue', value: '€2,340', change: '+18%', icon: '💰' },
  { label: 'Rating', value: '4.9★', change: '+0.1', icon: '⭐' },
  { label: 'New Clients', value: '12', change: '+8', icon: '👤' },
];

const bookings = [
  { client: 'Marie P.', service: 'Haircut & Style', date: 'Today, 14:00', status: 'Confirmed' },
  { client: 'Jan N.', service: 'Beard Trim', date: 'Today, 16:30', status: 'Confirmed' },
  { client: 'Klára V.', service: 'Full Color', date: 'Tomorrow, 10:00', status: 'Pending' },
  { client: 'Tomáš R.', service: 'Haircut', date: 'Tomorrow, 15:00', status: 'Confirmed' },
];

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} />
      <section className={styles.hero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <h1 className={styles.title}>Pro Dashboard</h1>
          <p className={styles.subtitle}>Manage your bookings, earnings, and profile</p>
        </div>
      </section>

      <section className={styles.stats}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {stats.map((s, i) => (
              <div key={i} className={styles.statCard}>
                <span className={styles.statIcon}>{s.icon}</span>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
                <span className={styles.statChange}>{s.change}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.bookings}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Upcoming Bookings</h2>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Client</span>
              <span>Service</span>
              <span>Date</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {bookings.map((b, i) => (
              <div key={i} className={styles.tableRow}>
                <span>{b.client}</span>
                <span>{b.service}</span>
                <span>{b.date}</span>
                <span className={`${styles.status} ${b.status === 'Confirmed' ? styles.confirmed : styles.pending}`}>{b.status}</span>
                <span><a href="#" className={styles.actionLink}>Manage</a></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.quickLinks}>
        <div className={styles.container}>
          <div className={styles.linksGrid}>
            <Link href="/pros/success-stories" className={styles.linkCard}>
              <span className={styles.linkIcon}>🌟</span>
              <h3>Success Stories</h3>
              <p>See how other pros are thriving</p>
            </Link>
            <Link href="/pros/support" className={styles.linkCard}>
              <span className={styles.linkIcon}>🛠️</span>
              <h3>Pro Support</h3>
              <p>Get help and resources</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}