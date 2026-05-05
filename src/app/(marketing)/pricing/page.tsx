'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './pricing.module.css';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    desc: 'Perfect for getting started',
    features: ['Browse professionals', 'Basic search filters', 'Book appointments', 'Standard support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    desc: 'For regular customers',
    features: ['Everything in Starter', 'Priority booking', 'Chat with pros', 'Gift card discounts', 'Booking history'],
    cta: 'Go Pro',
    popular: true,
  },
  {
    name: 'Premium',
    price: '$19.99',
    period: '/month',
    desc: 'For beauty enthusiasts',
    features: ['Everything in Pro', 'Unlimited chat', 'Exclusive deals', 'VIP support', 'Early access to new features', 'No service fees'],
    cta: 'Go Premium',
    popular: false,
  },
];

const proPlans = [
  {
    name: 'Basic',
    price: 'Free',
    desc: 'Start your practice',
    features: ['Profile listing', 'Up to 10 bookings/mo', 'Basic analytics', 'Standard support'],
    cta: 'Start Free',
  },
  {
    name: 'Professional',
    price: '$29.99',
    period: '/month',
    desc: 'Grow your business',
    features: ['Everything in Basic', 'Unlimited bookings', 'Smart scheduling', 'Promoted listing', 'Detailed analytics', 'Priority support'],
    cta: 'Get Professional',
    popular: true,
  },
  {
    name: 'Studio',
    price: '$79.99',
    period: '/month',
    desc: 'For multi-pro studios',
    features: ['Everything in Professional', 'Up to 5 team members', 'Team scheduling', 'Branded profile', 'API access', 'Dedicated account manager'],
    cta: 'Contact Sales',
  },
];

export default function PricingPage() {
  const [tab, setTab] = useState<'customer' | 'pro'>('customer');
  const currentPlans = tab === 'customer' ? plans : proPlans;

  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} />
      <section className={styles.hero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <h1 className={styles.title}>Pricing</h1>
          <p className={styles.subtitle}>Choose the plan that fits your needs. No hidden fees, cancel anytime.</p>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'customer' ? styles.tabActive : ''}`} onClick={() => setTab('customer')}>For Customers</button>
            <button className={`${styles.tab} ${tab === 'pro' ? styles.tabActive : ''}`} onClick={() => setTab('pro')}>For Professionals</button>
          </div>
        </div>
      </section>

      <section className={styles.plans}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {currentPlans.map((plan, i) => (
              <div key={i} className={`${styles.card} ${plan.popular ? styles.popular : ''}`}>
                {plan.popular && <span className={styles.badge}>Most Popular</span>}
                <h2 className={styles.planName}>{plan.name}</h2>
                <div className={styles.planPrice}>
                  <span className={styles.price}>{plan.price}</span>
                  {plan.period && <span className={styles.period}>{plan.period}</span>}
                </div>
                <p className={styles.planDesc}>{plan.desc}</p>
                <ul className={styles.features}>
                  {plan.features.map((f, j) => (
                    <li key={j} className={styles.feature}>
                      <span className={styles.check}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="#" className={`${styles.cta} ${plan.popular ? styles.ctaPrimary : ''}`}>{plan.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}