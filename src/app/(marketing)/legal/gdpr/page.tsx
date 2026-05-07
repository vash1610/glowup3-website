import Link from 'next/link';
import styles from '../legal.module.css';

export default function GdprPage() {
  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} />
      <section className={styles.hero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <h1 className={styles.title}>GDPR Compliance</h1>
          <p className={styles.date}>Last updated: March 1, 2026</p>
        </div>
      </section>
      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.prose}>
            <h2>Your Data Rights Under GDPR</h2>
            <p>As a user in the European Union, you have the following rights under the General Data Protection Regulation (GDPR):</p>
            <h2>Right to Access</h2>
            <p>You can request a copy of all personal data we hold about you at any time.</p>
            <h2>Right to Rectification</h2>
            <p>If your data is incorrect or incomplete, you have the right to have it corrected.</p>
            <h2>Right to Erasure</h2>
            <p>You can request deletion of your data. We will comply unless we have a legal obligation to retain it.</p>
            <h2>Right to Data Portability</h2>
            <p>You can request your data in a machine-readable format to transfer to another service.</p>
            <h2>Right to Object</h2>
            <p>You can object to processing of your data for marketing purposes at any time.</p>
            <h2>Data Protection Officer</h2>
            <p>Our DPO can be reached at dpo@glowup3.com. We respond to all requests within 30 days.</p>
          </div>
        </div>
      </section>
    </div>
  );
}