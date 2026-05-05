import Link from 'next/link';
import styles from '../legal.module.css';

export default function CookiesPage() {
  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} />
      <section className={styles.hero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <h1 className={styles.title}>Cookie Policy</h1>
          <p className={styles.date}>Last updated: March 1, 2026</p>
        </div>
      </section>
      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.prose}>
            <h2>1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve your experience.</p>
            <h2>2. How We Use Cookies</h2>
            <p>We use essential cookies for authentication and security. Analytics cookies help us understand how you use our platform. Functionality cookies remember your preferences.</p>
            <h2>3. Third-Party Cookies</h2>
            <p>We use services like Stripe for payments and Supabase for database functionality, which may set their own cookies.</p>
            <h2>4. Managing Cookies</h2>
            <p>You can control cookies through your browser settings. Note that disabling essential cookies may affect platform functionality.</p>
            <h2>5. Contact</h2>
            <p>For questions about our cookie policy, contact us at privacy@glowup3.com.</p>
          </div>
        </div>
      </section>
    </div>
  );
}