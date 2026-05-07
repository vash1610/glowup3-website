import Link from 'next/link';
import styles from '../legal.module.css';

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} />
      <section className={styles.hero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.date}>Last updated: March 1, 2026</p>
        </div>
      </section>
      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.prose}>
            <h2>1. Acceptance of Terms</h2>
            <p>By using GlowUp3, you agree to these terms. If you do not agree, please do not use our services.</p>
            <h2>2. Bookings & Payments</h2>
            <p>All bookings are confirmed upon payment. Cancellations made more than 24 hours in advance are fully refundable. Late cancellations may incur a fee.</p>
            <h2>3. Professional Conduct</h2>
            <p>Professionals agree to provide services as described and maintain professional standards. Customers agree to treat professionals with respect.</p>
            <h2>4. Wallet & Escrow</h2>
            <p>Payments are held in escrow until the service is completed. Funds are released to professionals 24 hours after service completion.</p>
            <h2>5. Limitation of Liability</h2>
            <p>GlowUp3 acts as a platform connecting customers and professionals. We are not liable for the quality of services provided by professionals.</p>
            <h2>6. Changes to Terms</h2>
            <p>We may update these terms at any time. Users will be notified of material changes via email.</p>
          </div>
        </div>
      </section>
    </div>
  );
}