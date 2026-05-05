'use client';

import Link from 'next/link';
import Icon from '@/components/Icon';
import styles from './success.module.css';

const stories = [
  { name: 'Anna Novak', role: 'Hair Stylist', location: 'Prague', growth: '3x revenue', icon: 'hair', quote: 'GlowUp3 completely changed my business. The Available Now feature fills my slow hours with last-minute bookings I would never have gotten otherwise.', before: '€1,500/mo', after: '€4,500/mo', clients: '+200%' },
  { name: 'David M.', role: 'Massage Therapist', location: 'Brno', growth: '250 clients', icon: 'massage', quote: 'I was struggling to find clients after moving to a new city. Within 3 months on GlowUp3, I had a full schedule and steady income.', before: '€800/mo', after: '€3,200/mo', clients: '+150%' },
  { name: 'Studio Glow', role: 'Beauty Salon', location: 'Ostrava', growth: '5x bookings', icon: 'store', quote: "The team workspace feature allows us to manage 5 stylists seamlessly. Shared calendar, split earnings, and team booking — it's everything we needed.", before: '50 bookings/mo', after: '250 bookings/mo', clients: '+400%' },
  { name: 'Eva & Co.', role: 'Nail Studio', location: 'Prague', growth: '1,000+ clients', icon: 'nails', quote: 'Gift cards were a game changer. During the holidays, we sold over 200 gift cards — bringing in new customers who came back again and again.', before: '30 bookings/mo', after: '150 bookings/mo', clients: '+300%' },
];

const iconMap: Record<string, React.ReactNode> = {
  hair: <Icon name="hair" size={40} />,
  massage: <Icon name="massage" size={40} />,
  store: <Icon name="store" size={40} />,
  nails: <Icon name="nails" size={40} />,
};

export default function SuccessStoriesPage() {
  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} />
      <section className={styles.hero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <h1 className={styles.title}>Success Stories</h1>
          <p className={styles.subtitle}>Hear from professionals who transformed their business with GlowUp3</p>
        </div>
      </section>

      <section className={styles.stories}>
        <div className={styles.container}>
          {stories.map((story, i) => (
            <div key={i} className={styles.storyCard}>
              <div className={styles.storyHeader}>
                <span className={styles.storyImage}>{iconMap[story.icon]}</span>
                <div>
                  <h3 className={styles.storyName}>{story.name}</h3>
                  <span className={styles.storyRole}>{story.role} • {story.location}</span>
                </div>
                <span className={styles.storyGrowth}>{story.growth}</span>
              </div>
              <blockquote className={styles.quote}>"{story.quote}"</blockquote>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Before</span>
                  <span className={styles.statValueOld}>{story.before}</span>
                </div>
                <div className={styles.statArrow}>→</div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>After</span>
                  <span className={styles.statValueNew}>{story.after}</span>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Client Growth</span>
                  <span className={styles.statGrowth}>{story.clients}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2>Ready to Write Your Success Story?</h2>
            <p>Join 1,200+ professionals already growing their business with GlowUp3.</p>
            <a href="#" className={styles.ctaBtn}>Become a Pro →</a>
          </div>
        </div>
      </section>
    </div>
  );
}