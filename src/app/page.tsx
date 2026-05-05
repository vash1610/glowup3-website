import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <div className={styles.logo}>✨ GlowUp3</div>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#download">Download</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>✨ #1 Beauty & Wellness App</span>
          <h1 className={styles.heroTitle}>
            Book Beauty Services<br />
            <span className={styles.heroHighlight}>From Top Professionals</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Connect with verified beauty professionals in your area. Book appointments instantly, 
            message directly, and pay securely – all in one app.
          </p>
          <div className={styles.heroButtons}>
            <a href="#download" className={styles.primaryBtn}>
              Download App
            </a>
            <a href="#how-it-works" className={styles.secondaryBtn}>
              Learn More
            </a>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>10K+</span>
              <span className={styles.statLabel}>Active Users</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Professionals</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>50+</span>
              <span className={styles.statLabel}>Services</span>
            </div>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.phoneMockup}>
            <div className={styles.phoneScreen}>
              <div className={styles.appHeader}>
                <span>👋 Welcome</span>
              </div>
              <div className={styles.appContent}>
                <div className={styles.appCard}>
                  <span>📅</span>
                  <span>Book Appointment</span>
                </div>
                <div className={styles.appCard}>
                  <span>💬</span>
                  <span>Messages</span>
                </div>
                <div className={styles.appCard}>
                  <span>💳</span>
                  <span>Wallet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>FEATURES</span>
          <h2 className={styles.sectionTitle}>Everything You Need</h2>
          <p className={styles.sectionSubtitle}>
            Powerful features to make your beauty experience seamless
          </p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📅</div>
            <h3>Smart Booking</h3>
            <p>Book appointments with real-time availability. Choose your preferred pro, time, and service in seconds.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💬</div>
            <h3>Direct Messaging</h3>
            <p>Communicate directly with your professional. Ask questions, confirm details, no middleman.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💳</div>
            <h3>Secure Payments</h3>
            <p>Pay with confidence. Your money is protected until the service is completed.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎁</div>
            <h3>Gift Cards</h3>
            <p>Send gift cards to friends and family. Perfect for birthdays, holidays, or just because.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⭐</div>
            <h3>Reviews & Ratings</h3>
            <p>Read authentic reviews from real customers. Make informed decisions about your beauty care.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📍</div>
            <h3>Available Now</h3>
            <p>Need something today? Find professionals who are available right now.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>HOW IT WORKS</span>
          <h2 className={styles.sectionTitle}>3 Simple Steps</h2>
        </div>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Download & Sign Up</h3>
            <p>Get the GlowUp3 app and create your free account in under a minute.</p>
          </div>
          <div className={styles.stepConnector} />
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Book Your Service</h3>
            <p>Browse professionals, read reviews, and book your preferred time slot.</p>
          </div>
          <div className={styles.stepConnector} />
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Look Your Best</h3>
            <p>Show up, enjoy your service, and leave a review to help others.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Ready to Glow Up?</h2>
          <p>Join thousands of satisfied users who trust GlowUp3 for their beauty needs.</p>
          <a href="#" className={styles.ctaButton}>Download for iOS & Android</a>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <span className={styles.logo}>✨ GlowUp3</span>
            <p>Your beauty, our priority.</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#">Pricing</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Contact</a>
              <a href="#">Careers</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 GlowUp3. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
