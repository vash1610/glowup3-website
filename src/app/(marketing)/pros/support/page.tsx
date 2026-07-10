'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import styles from './support.module.css';

const faqs = [
  { q: 'How do I get paid?', a: 'Earnings are released to your wallet 24 hours after the service is completed. You can withdraw to your bank account anytime with no minimum threshold.' },
  { q: 'Can I set my own schedule?', a: 'Absolutely! You control your availability. Set your working hours, block out times, and manage your calendar from the Pro Dashboard.' },
  { q: 'What if a client cancels?', a: 'Our cancellation policy protects you. Clients who cancel within 24 hours are charged a fee, and you still receive 50% of the booking amount.' },
  { q: 'How do I promote my profile?', a: 'Your profile is automatically shown to clients searching in your area. You can also share your profile link on social media for extra visibility.' },
  { q: 'Are there any hidden fees?', a: 'No hidden fees. Our commission is transparent — 15% per booking on the Free plan, 10% on the Professional plan, and 8% on the Studio plan.' },
  { q: 'How do I handle multiple clients at once?', a: 'The Studio plan supports up to 5 team members with shared calendar, team scheduling, and split earnings — perfect for multi-staff businesses.' },
];

export default function SupportPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} />
      <section className={styles.hero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <h1 className={styles.title}>Pro Support</h1>
          <p className={styles.subtitle}>Everything you need to succeed on Todayly</p>
        </div>
      </section>

      <section className={styles.resources}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.resourceCard}>
              <span className={styles.resourceIcon}><Icon name="book" size={28} color="#667eea" /></span>
              <h3>Getting Started Guide</h3>
              <p>Step-by-step walkthrough for new professionals</p>
              <a href="#" className={styles.resourceLink}>Read Guide →</a>
            </div>
            <div className={styles.resourceCard}>
              <span className={styles.resourceIcon}><Icon name="play" size={28} color="#667eea" /></span>
              <h3>Video Tutorials</h3>
              <p>Watch how top pros optimize their profiles</p>
              <a href="#" className={styles.resourceLink}>Watch Now →</a>
            </div>
            <div className={styles.resourceCard}>
              <span className={styles.resourceIcon}><Icon name="chat" size={28} color="#667eea" /></span>
              <h3>Community Forum</h3>
              <p>Connect with other professionals, share tips</p>
              <a href="#" className={styles.resourceLink}>Join Forum →</a>
            </div>
            <div className={styles.resourceCard}>
              <span className={styles.resourceIcon}><Icon name="email" size={28} color="#667eea" /></span>
              <h3>Priority Support</h3>
              <p>Pro and Studio members get 24/7 priority support</p>
              <a href="#" className={styles.resourceLink}>Contact Support →</a>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.faq}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq, i) => (
              <div key={i} className={`${styles.faqItem} ${openIndex === i ? styles.faqOpen : ''}`}>
                <button className={styles.faqQuestion} onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className={styles.faqIcon}><Icon name={openIndex === i ? 'minus' : 'plus'} size={20} color="#667eea" /></span>
                </button>
                {openIndex === i && <div className={styles.faqAnswer}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}