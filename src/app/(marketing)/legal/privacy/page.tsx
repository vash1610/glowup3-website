import Link from 'next/link';
import styles from '../legal.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} />
      <section className={styles.hero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.date}>Last updated: March 1, 2026</p>
        </div>
      </section>
      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.prose}>
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide when creating an account, making a booking, or contacting support. This includes your name, email address, phone number, and payment information.</p>
            <h2>2. How We Use Your Information</h2>
            <p>We use your information to process bookings, facilitate communication between customers and professionals, process payments, and improve our services.</p>
            <h2>3. Data Sharing</h2>
            <p>We share necessary information with professionals when you book a service (name, contact details, booking details). We never sell your personal data to third parties.</p>
            <h2>4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption at rest and in transit, regular security audits, and strict access controls.</p>
            <h2>5. Your Rights</h2>
            <p>Under GDPR, you have the right to access, rectify, delete, and port your data. You can manage most of this directly in your account settings.</p>
            <h2>6. Contact</h2>
            <p>For privacy-related inquiries, contact us at privacy@glowup3.com or through our <Link href="/contact">contact page</Link>.</p>
          </div>
        </div>
      </section>
    </div>
  );
}