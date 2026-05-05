'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './about.module.css';

const team = [
  { name: 'Anna Novak', role: 'CEO & Founder', bio: 'Former beauty salon owner who saw the need for better booking technology.', avatar: '👩‍💼' },
  { name: 'David Chen', role: 'CTO', bio: '10+ years building scalable platforms. Previously at Google and Uber.', avatar: '👨‍💻' },
  { name: 'Sarah Williams', role: 'Head of Design', bio: 'Award-winning designer passionate about beautiful user experiences.', avatar: '🎨' },
  { name: 'Marcus Johnson', role: 'VP of Growth', bio: 'Scaled three startups from 0 to 1M+ users. Beauty industry expert.', avatar: '📈' },
];

const milestones = [
  { year: '2023', event: 'GlowUp3 founded in Prague, Czech Republic' },
  { year: '2024', event: 'Launched MVP with 100 professionals onboarded' },
  { year: '2024', event: 'Reached 10,000 bookings milestone' },
  { year: '2025', event: 'Raised $2M seed funding from top investors' },
  { year: '2025', event: 'Expanded to 5 countries across Europe' },
  { year: '2026', event: '50K+ downloads and 1,200+ active professionals' },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} />
      
      <section className={styles.hero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <h1 className={styles.title}>About GlowUp3</h1>
          <p className={styles.subtitle}>
            We're on a mission to make beauty and wellness services accessible to everyone. 
            Founded in 2023, GlowUp3 connects customers with top-rated professionals in salons, 
            spas, and fitness studios across Europe.
          </p>
        </div>
      </section>

      <section className={styles.values}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <span className={styles.valueIcon}>🤝</span>
              <h3>Trust First</h3>
              <p>Every professional is verified. Every review is authentic. Every payment is secure.</p>
            </div>
            <div className={styles.valueCard}>
              <span className={styles.valueIcon}>⚡</span>
              <h3>Instant Access</h3>
              <p>No more waiting. Find available professionals and book in seconds.</p>
            </div>
            <div className={styles.valueCard}>
              <span className={styles.valueIcon}>💜</span>
              <h3>Community</h3>
              <p>We're building a community where beauty professionals and clients thrive together.</p>
            </div>
            <div className={styles.valueCard}>
              <span className={styles.valueIcon}>🌍</span>
              <h3>Global</h3>
              <p>Breaking down language barriers with real-time translation and global reach.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.milestones}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Journey</h2>
          <div className={styles.timeline}>
            {milestones.map((m, i) => (
              <div key={i} className={styles.timelineItem}>
                <div className={styles.timelineYear}>{m.year}</div>
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>{m.event}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.team}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Meet the Team</h2>
          <div className={styles.teamGrid}>
            {team.map((member, i) => (
              <div key={i} className={styles.teamCard}>
                <div className={styles.teamAvatar}>{member.avatar}</div>
                <h3 className={styles.teamName}>{member.name}</h3>
                <span className={styles.teamRole}>{member.role}</span>
                <p className={styles.teamBio}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}