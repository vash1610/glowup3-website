'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './blog.module.css';

const posts = [
  { slug: 'future-of-beauty', title: 'The Future of Beauty Booking: AI, IoT & Personalization', excerpt: 'Discover how technology is transforming the beauty industry in 2026 and beyond.', category: 'Trends', date: 'Mar 15, 2026', readTime: '5 min read', image: '🚀' },
  { slug: 'pro-tips-getting-booked', title: '10 Pro Tips to Get Fully Booked Every Week', excerpt: 'Learn how top professionals on GlowUp3 maintain a full schedule with smart strategies.', category: 'For Pros', date: 'Mar 10, 2026', readTime: '7 min read', image: '💡' },
  { slug: 'gift-card-guide', title: 'The Ultimate Guide to Digital Gift Cards for Services', excerpt: 'Everything you need to know about giving and receiving gift cards for beauty services.', category: 'Guides', date: 'Mar 5, 2026', readTime: '4 min read', image: '🎁' },
  { slug: 'security-escrow', title: 'How Escrow Payments Protect Both Customers and Pros', excerpt: 'A deep dive into our secure payment system and how it builds trust on GlowUp3.', category: 'Product', date: 'Feb 28, 2026', readTime: '6 min read', image: '🔒' },
  { slug: 'community-spotlight', title: 'Community Spotlight: Anna\'s Salon Success Story', excerpt: 'From struggling to fill appointments to 3x revenue — one salon owner\'s journey with GlowUp3.', category: 'Stories', date: 'Feb 20, 2026', readTime: '8 min read', image: '🌟' },
  { slug: 'seasonal-trends', title: 'Spring Beauty Trends 2026: What\'s In and What\'s Out', excerpt: 'Stay ahead of the curve with our curated list of the hottest beauty trends this spring.', category: 'Trends', date: 'Feb 15, 2026', readTime: '5 min read', image: '🌸' },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Trends', 'For Pros', 'Guides', 'Product', 'Stories'];

  const filtered = activeCategory === 'All' ? posts : posts.filter(p => p.category === activeCategory);

  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} />
      
      <section className={styles.hero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <h1 className={styles.title}>Blog</h1>
          <p className={styles.subtitle}>Insights, tips, and stories from the GlowUp3 community</p>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.filters}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {filtered.map((post, i) => (
              <article key={i} className={styles.card}>
                <div className={styles.cardImage}>{post.image}</div>
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardCategory}>{post.category}</span>
                    <span className={styles.cardDate}>{post.date}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{post.title}</h3>
                  <p className={styles.cardExcerpt}>{post.excerpt}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.readTime}>{post.readTime}</span>
                    <a href="#" className={styles.readMore}>Read More →</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}