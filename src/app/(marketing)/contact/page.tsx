'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './contact.module.css';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgOrb} />
      <section className={styles.hero}>
        <div className={styles.container}>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>Have a question, feedback, or just want to say hi? We'd love to hear from you.</p>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.info}>
              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>📧</span>
                <h3>Email</h3>
                <p>hello@glowup3.com</p>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>📍</span>
                <h3>Office</h3>
                <p>Na Příkopě 15, Prague 1<br />110 00, Czech Republic</p>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>⏰</span>
                <h3>Hours</h3>
                <p>Mon–Fri: 9:00 – 18:00 CET<br />Weekend: Closed</p>
              </div>
            </div>

            <div className={styles.formWrapper}>
              {submitted ? (
                <div className={styles.success}>
                  <span className={styles.successIcon}>✅</span>
                  <h2>Message Sent!</h2>
                  <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                  <button className={styles.resetBtn} onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="name">Name</label>
                      <input id="name" type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Your name" />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email</label>
                      <input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="subject">Subject</label>
                    <input id="subject" type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required placeholder="How can we help?" />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="message">Message</label>
                    <textarea id="message" rows={6} value={form.message} onChange={e => setForm({...form, message: e.target.value})} required placeholder="Tell us more..." />
                  </div>
                  <button type="submit" className={styles.submitBtn}>Send Message →</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}