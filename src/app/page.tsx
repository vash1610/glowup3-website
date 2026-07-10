'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/Icon';
import styles from './page.module.css';

const iconMap: Record<string, React.ReactNode> = {
  lightning: <Icon name="lightning" size={24} />,
  gift: <Icon name="gift" size={24} />,
  chat: <Icon name="chat" size={24} />,
  wallet: <Icon name="wallet" size={24} />,
  team: <Icon name="team" size={24} />,
  shield: <Icon name="shield" size={24} />,
};

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [countersVisible, setCountersVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setCountersVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: 'lightning',
      title: 'Available Now',
      subtitle: 'Get Instant Bookings',
      description: 'AI-powered system finds professionals available right now. Smart discounts automatically suggest the best prices during off-peak hours.',
      color: '#fbbf24'
    },
    {
      icon: 'gift',
      title: 'Gift Cards & Items',
      subtitle: 'Perfect for Any Occasion',
      description: 'Send beautiful digital gifts for any service. 10+ stunning designs for birthdays, holidays, or just because. Redeemable instantly.',
      color: '#f472b6'
    },
    {
      icon: 'chat',
      title: 'Real-Time Chat',
      subtitle: 'Translate Automatically',
      description: 'Built-in translation lets you communicate in any language. Reactions, quick replies, and typing indicators make chatting effortless.',
      color: '#60a5fa'
    },
    {
      icon: 'wallet',
      title: 'Secure Wallet',
      subtitle: 'Money Protection',
      description: 'Your money is held safely in escrow until the service is complete. Withdraw earnings instantly to your bank account.',
      color: '#34d399'
    },
    {
      icon: 'team',
      title: 'Team Workspaces',
      subtitle: 'Manage Your Team',
      description: 'Create teams, share calendars, split earnings, and collaborate on bookings. Perfect for salons and studios.',
      color: '#a78bfa'
    },
    {
      icon: 'shield',
      title: 'Trust System',
      subtitle: 'Verified Everyone',
      description: 'Both customers and professionals build trust scores. Identity verified, reviews authentic, everyone accountable.',
      color: '#f97316'
    }
  ];

  const testimonials = [
    {
      name: 'Martina K.',
      role: 'Hair Stylist',
      text: 'Todayly transformed my business. The Available Now feature brings me customers even during slow days.',
      rating: 5
    },
    {
      name: 'Petr S.',
      role: 'Personal Trainer',
      text: 'The wallet system and escrow give me peace of mind. I know I\'ll get paid for my work.',
      rating: 5
    },
    {
      name: 'Lucie M.',
      role: 'Beauty Enthusiast',
      text: 'Gift cards are perfect! I gifted my mom a spa day and she loved the beautiful card design.',
      rating: 5
    }
  ];

  return (
    <main className={styles.main}>
      {/* Animated Background */}
      <div className={styles.bgAnimation}>
        <div className={styles.gradientOrb1} style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
        <div className={styles.gradientOrb2} style={{ transform: `translateY(${scrollY * 0.2}px)` }} />
        <div className={styles.gridPattern} />
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <div className={styles.logo}>
            <Icon name="sparkle" size={24} color="#667eea" />
            <span>Todayly</span>
          </div>
          <div className={styles.navLinks}>
          <a href="/pros">Browse Pros</a>
            <a href="/pricing">Pricing</a>
            <a href="/about">About</a>
            <a href="#download" className={styles.navCta}>Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.badgePulse} />
            <span>Available Now on iOS & Android</span>
          </div>
          <h1 className={styles.heroTitle}>
            Book Beauty Services<br />
            <span className={styles.heroHighlight}>From Top Professionals</span>
          </h1>
          <p className={styles.heroSubtitle}>
            The all-in-one beauty booking app. Find available professionals instantly, 
            message directly, pay securely, and send beautiful gifts — all in one place.
          </p>
          <div className={styles.heroButtons}>
            <a href="https://apps.apple.com/app/glowup3/id123456789" className={styles.primaryBtn}>
              <Icon name="apple" size={20} color="#fff" /> Download App
            </a>
            <a href="/pros" className={styles.secondaryBtn}>
              <Icon name="play" size={18} /> See Features
            </a>
          </div>
          
          {/* Stats */}
          <div className={`${styles.heroStats} ${countersVisible ? styles.visible : ''}`}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>50K+</span>
              <span className={styles.statLabel}>Downloads</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>1,200+</span>
              <span className={styles.statLabel}>Professionals</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>4.8★</span>
              <span className={styles.statLabel}>App Rating</span>
            </div>
          </div>
        </div>

        {/* Phone Mockup */}
        <div className={styles.heroVisual}>
          <div className={styles.phoneWrapper}>
            <div className={styles.phoneGlow} />
            <div className={styles.phoneFrame}>
              <div className={styles.phoneNotch} />
              <div className={styles.phoneScreen}>
                <div className={styles.appHeader}>
                  <Icon name="sparkle" size={16} color="#667eea" />
                  <span> Todayly</span>
                  <Icon name="profile" size={16} />
                </div>
                <div className={styles.appSearch}>
                  <Icon name="search" size={14} />
                  <span>Search services...</span>
                </div>
                <div className={styles.appSection}>
                  <h4>Available Now</h4>
                  <div className={styles.appCards}>
                    <div className={styles.appCard}>
                      <div className={styles.cardIcon}><Icon name="hair" size={28} color="#667eea" /></div>
                      <div className={styles.cardInfo}>
                        <span className={styles.cardTitle}>Hair Styling</span>
                        <span className={styles.cardPro}>Anna K. • 4.9★</span>
                        <span className={styles.cardTime}><Icon name="lightning" size={12} color="#fbbf24" /> Available Now</span>
                      </div>
                    </div>
                    <div className={styles.appCard}>
                      <div className={styles.cardIcon}><Icon name="massage" size={28} color="#667eea" /></div>
                      <div className={styles.cardInfo}>
                        <span className={styles.cardTitle}>Massage</span>
                        <span className={styles.cardPro}>Petr M. • 4.8★</span>
                        <span className={styles.cardTime}><Icon name="lightning" size={12} color="#fbbf24" /> Available Now</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.appSection}>
                  <h4>Quick Book</h4>
                  <div className={styles.appQuickActions}>
                    <div className={styles.quickAction}><Icon name="hair" size={16} /> Hair</div>
                    <div className={styles.quickAction}><Icon name="makeup" size={16} /> Makeup</div>
                    <div className={styles.quickAction}><Icon name="nails" size={16} /> Nails</div>
                    <div className={styles.quickAction}><Icon name="massage" size={16} /> Spa</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className={styles.trusted}>
        <p>Trusted by professionals at</p>
        <div className={styles.trustedLogos}>
          <span><Icon name="store" size={16} /> Studios</span>
          <span><Icon name="hair" size={16} /> Salons</span>
          <span><Icon name="spa" size={16} /> Spas</span>
          <span><Icon name="fitness" size={16} /> Fitness</span>
          <span><Icon name="design" size={16} /> Beauty</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>POWERFUL FEATURES</span>
          <h2 className={styles.sectionTitle}>Everything You Need to Glow Up</h2>
          <p className={styles.sectionSubtitle}>
            From instant bookings to secure payments, we've thought of everything
          </p>
        </div>

        {/* Feature Tabs */}
        <div className={styles.featureTabs}>
          {features.map((feature, index) => (
            <button
              key={index}
              className={`${styles.featureTab} ${activeFeature === index ? styles.active : ''}`}
              onClick={() => setActiveFeature(index)}
              style={{ '--accent': feature.color } as React.CSSProperties}
            >
              <span className={styles.tabIcon}>{iconMap[feature.icon]}</span>
              <span className={styles.tabTitle}>{feature.title}</span>
            </button>
          ))}
        </div>

        {/* Feature Detail */}
        <div className={styles.featureDetail}>
          <div className={styles.featureVisual}>
            <div className={styles.featureBox} style={{ '--accent': features[activeFeature].color } as React.CSSProperties}>
              <span className={styles.featureBoxIcon}>{iconMap[features[activeFeature].icon]}</span>
              <span className={styles.featureBoxTitle}>{features[activeFeature].title}</span>
            </div>
          </div>
          <div className={styles.featureText}>
            <span className={styles.featureSubtitle}>{features[activeFeature].subtitle}</span>
            <h3>{features[activeFeature].title}</h3>
            <p>{features[activeFeature].description}</p>
            <a href="/pricing" className={styles.featureCta}>
              Learn More <span>→</span>
            </a>
          </div>
        </div>

        {/* Feature Grid */}
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={styles.featureCard}
              style={{ '--accent': feature.color } as React.CSSProperties}
            >
              <div className={styles.featureCardIcon}>{iconMap[feature.icon]}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>SIMPLE PROCESS</span>
          <h2 className={styles.sectionTitle}>Book in 3 Easy Steps</h2>
        </div>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepIcon}><Icon name="phone" size={32} color="#667eea" /></div>
            <div className={styles.stepNumber}>1</div>
            <h3>Download & Sign Up</h3>
            <p>Get the app and create your free account in under 2 minutes. No credit card required.</p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepIcon}><Icon name="search" size={32} color="#667eea" /></div>
            <div className={styles.stepNumber}>2</div>
            <h3>Find Your Pro</h3>
            <p>Browse verified professionals, read reviews, check availability, and book your time.</p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepIcon}><Icon name="sparkle" size={32} color="#667eea" /></div>
            <div className={styles.stepNumber}>3</div>
            <h3>Glow Up!</h3>
            <p>Show up, enjoy your service, and leave a review to help others.</p>
          </div>
        </div>
      </section>

      {/* Available Now Highlight */}
      <section className={styles.highlight}>
        <div className={styles.highlightContent}>
          <span className={styles.highlightBadge}><Icon name="lightning" size={14} color="#fbbf24" /> NOW FEATURE</span>
          <h2>Need Something Today?</h2>
          <p>Our AI-powered "Available Now" feature finds professionals who are ready to see you right now. Can't wait? No problem — Todayly has you covered.</p>
          <div className={styles.highlightFeatures}>
            <div className={styles.highlightFeature}>
              <Icon name="lightning" size={18} color="#fbbf24" />
              <span>Instant Matching</span>
            </div>
            <div className={styles.highlightFeature}>
              <Icon name="bulb" size={18} color="#fbbf24" />
              <span>Smart Discounts</span>
            </div>
            <div className={styles.highlightFeature}>
              <Icon name="location" size={18} color="#fbbf24" />
              <span>Location Aware</span>
            </div>
          </div>
        </div>
        <div className={styles.highlightVisual}>
          <div className={styles.discountCard}>
            <span className={styles.discountLabel}>AI Suggested Discount</span>
            <span className={styles.discountPercent}>25% OFF</span>
            <span className={styles.discountReason}>Slow period pricing</span>
            <div className={styles.discountTimer}><Icon name="clock" size={14} /> Ends in 2h 15m</div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className={styles.testimonials}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>REAL REVIEWS</span>
          <h2 className={styles.sectionTitle}>What People Say</h2>
        </div>
        <div className={styles.testimonialGrid}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles.testimonialCard}>
              <div className={styles.testimonialStars}>
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Icon key={i} name="star" size={16} color="#fbbf24" />
                ))}
              </div>
              <p className={styles.testimonialText}>"{testimonial.text}"</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <span className={styles.authorName}>{testimonial.name}</span>
                  <span className={styles.authorRole}>{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className={styles.cta}>
        <div className={styles.ctaGlow} />
        <div className={styles.ctaContent}>
          <h2>Ready to Glow Up?</h2>
          <p>Join 50,000+ users who trust Todayly for their beauty needs. Download free today.</p>
          <div className={styles.ctaButtons}>
            <a href="https://apps.apple.com/app/glowup3/id123456789" className={styles.storeBtn}>
              <Icon name="apple" size={24} color="#fff" />
              <div>
                <span>Download on the</span>
                <span>App Store</span>
              </div>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.glowup3" className={styles.storeBtn}>
              <Icon name="android" size={24} color="#fff" />
              <div>
                <span>Get it on</span>
                <span>Google Play</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.logo}>
              <Icon name="sparkle" size={24} color="#667eea" />
              <span>Todayly</span>
            </div>
            <p>The all-in-one beauty booking platform connecting you with top professionals.</p>
            <div className={styles.socialLinks}>
              <a href="https://facebook.com/glowup3" target="_blank" rel="noopener noreferrer"><Icon name="facebook" size={20} /></a>
              <a href="https://instagram.com/glowup3" target="_blank" rel="noopener noreferrer"><Icon name="instagram" size={20} /></a>
              <a href="https://twitter.com/glowup3" target="_blank" rel="noopener noreferrer"><Icon name="twitter" size={20} /></a>
              <a href="https://youtube.com/@glowup3" target="_blank" rel="noopener noreferrer"><Icon name="youtube" size={20} /></a>
            </div>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>Product</h4>
              <a href="/pros">Browse Pros</a>
              <a href="/pricing">Pricing</a>
              <a href="/about">About</a>
              <a href="#download">Get the App</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>For Pros</h4>
              <a href="/pros">Become a Pro</a>
              <a href="/pros/dashboard">Pro Dashboard</a>
              <a href="/pros/success-stories">Success Stories</a>
              <a href="/pros/support">Pro Support</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Company</h4>
              <a href="/about">About Us</a>
              <a href="/blog">Blog</a>
              <a href="/careers">Careers</a>
              <a href="/contact">Contact</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Legal</h4>
              <a href="/legal/privacy">Privacy Policy</a>
              <a href="/legal/terms">Terms of Service</a>
              <a href="/legal/cookies">Cookie Policy</a>
              <a href="/legal/gdpr">GDPR</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 Todayly. All rights reserved. Made with <Icon name="heart" size={14} color="#f472b6" /> for the beauty community.</p>
        </div>
      </footer>
    </main>
  );
}