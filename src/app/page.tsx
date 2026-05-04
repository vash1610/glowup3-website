import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>Welcome to GlowUp3</h1>
          <p>Book beauty and wellness services from top professionals</p>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <h3>📅 Book Appointments</h3>
              <p>Easily book appointments with local beauty and wellness professionals.</p>
            </div>
            <div className="feature-card">
              <h3>💬 Direct Messaging</h3>
              <p>Communicate directly with your chosen professionals.</p>
            </div>
            <div className="feature-card">
              <h3>💳 Secure Payments</h3>
              <p>Safe and secure payment processing with wallet system.</p>
            </div>
            <div className="feature-card">
              <h3>🎁 Gift Cards</h3>
              <p>Send gift cards to friends and family for any service.</p>
            </div>
            <div className="feature-card">
              <h3>⭐ Reviews & Ratings</h3>
              <p>Read honest reviews from real customers.</p>
            </div>
            <div className="feature-card">
              <h3>📍 Available Now</h3>
              <p>Find professionals available for immediate appointments.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Get Started Today</h2>
          <p>Download the GlowUp3 app to book your first appointment.</p>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 GlowUp3. All rights reserved.</p>
          <p>Powered by Supabase</p>
        </div>
      </footer>

      <style jsx>{`
        .cta {
          padding: 60px 20px;
          background: #f0f0f0;
          text-align: center;
        }
        .cta h2 {
          font-size: 2rem;
          margin-bottom: 10px;
        }
      `}</style>
    </main>
  );
}
