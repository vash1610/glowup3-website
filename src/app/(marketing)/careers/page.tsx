'use client';

import Link from 'next/link';
import Icon from '@/components/Icon';
import styles from './careers.module.css';

const jobs = [
  { title: 'Senior Full-Stack Developer', dept: 'Engineering', location: 'Prague, CZ (Hybrid)', type: 'Full-time', icon: 'code' },
  { title: 'Product Designer', dept: 'Design', location: 'Prague, CZ (Hybrid)', type: 'Full-time', icon: 'design' },
  { title: 'Growth Marketing Lead', dept: 'Marketing', location: 'Remote (EU)', type: 'Full-time', icon: 'growth' },
  { title: 'Customer Success Manager', dept: 'Operations', location: 'Remote (EU)', type: 'Full-time', icon: 'handshake' },
  { title: 'iOS Developer', dept: 'Engineering', location: 'Prague, CZ (Hybrid)', type: 'Full-time', icon: 'phone' },
  { title: 'Data Analyst', dept: 'Data', location: 'Remote (EU)', type: 'Full-time', icon: 'analytics' },
];

const perks = [
  { icon: 'vacation', title: 'Unlimited PTO', desc: 'Take time when you need it. We trust you.' },
  { icon: 'fitness', title: 'Wellness Budget', desc: '€500/year for gym, massage, or therapy.' },
  { icon: 'book', title: 'Learning Fund', desc: '€2,000/year for courses and conferences.' },
  { icon: 'globe', title: 'Remote Friendly', desc: 'Work from anywhere in Europe.' },
  { icon: 'food', title: 'Lunch & Snacks', desc: 'Daily catered lunch in our Prague office.' },
  { icon: 'transit', title: 'Transit Pass', desc: 'Fully covered public transportation.' },
];

export default function CareersPage() {
  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} />
      <section className={styles.hero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <h1 className={styles.title}>Join the Todayly Team</h1>
          <p className={styles.subtitle}>Help us build the future of beauty booking. We're looking for passionate people who love what they do.</p>
        </div>
      </section>

      <section className={styles.perks}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Work With Us</h2>
          <div className={styles.perksGrid}>
            {perks.map((p, i) => (
              <div key={i} className={styles.perkCard}>
                <span className={styles.perkIcon}><Icon name={p.icon as any} size={36} color="#667eea" /></span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.openings}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Open Positions</h2>
          <div className={styles.jobsList}>
            {jobs.map((job, i) => (
              <div key={i} className={styles.jobCard}>
                <div className={styles.jobLeft}>
                  <span className={styles.jobEmoji}><Icon name={job.icon as any} size={28} color="#667eea" /></span>
                  <div>
                    <h3 className={styles.jobTitle}>{job.title}</h3>
                    <div className={styles.jobMeta}>
                      <span>{job.dept}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                </div>
                <a href="#" className={styles.jobApply}>Apply Now →</a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}