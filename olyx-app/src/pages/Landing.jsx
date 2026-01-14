import { Link } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div className="public-page">
      <AnimatedBackground />
      <Header />

      <main className="public-content">
        {/* Hero Section */}
        <section className="hero">
          <div className="container hero-container">
            <h1 className="hero-title fade-in">
              The Next-Generation
              <br />
              Omegle Alternative
            </h1>
            <p className="hero-subtitle fade-in delay-1">
              Real people. No bots. No recordings.
              <br />
              Just safe, meaningful conversations.
            </p>
            <div className="hero-cta fade-in delay-2">
              <Link to="/register" className="btn btn-primary btn-hero">
                Start Chatting Now
              </Link>
              <Link to="/login" className="btn btn-secondary btn-hero">
                Login
              </Link>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="trust-signals">
          <div className="container">
            <div className="trust-grid">
              <div className="trust-item">
                <div className="trust-icon">🔒</div>
                <div className="trust-label">No recordings</div>
              </div>
              <div className="trust-item">
                <div className="trust-icon">🤖</div>
                <div className="trust-label">No bots</div>
              </div>
              <div className="trust-item">
                <div className="trust-icon">🧠</div>
                <div className="trust-label">Smart matching</div>
              </div>
              <div className="trust-item">
                <div className="trust-icon">🌍</div>
                <div className="trust-label">Global community</div>
              </div>
              <div className="trust-item">
                <div className="trust-icon">📱</div>
                <div className="trust-label">Mobile & desktop</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <div className="container">
            <h2 className="section-title">Why Olyx.site is Different</h2>

            <div className="features-grid-modern">
              <div className="feature-modern">
                <div className="feature-number">01</div>
                <h3>Smart Gender & Region Matching</h3>
                <p>
                  Match by gender and region preferences. Paid users unlock advanced
                  filters for better connections.
                </p>
              </div>

              <div className="feature-modern">
                <div className="feature-number">02</div>
                <h3>Bot-Free Conversations</h3>
                <p>
                  Advanced detection systems ensure you're always talking to real
                  humans, not automated bots or fake streams.
                </p>
              </div>

              <div className="feature-modern">
                <div className="feature-number">03</div>
                <h3>Video + Text Together</h3>
                <p>
                  Talk face-to-face and exchange messages simultaneously. Build real
                  connections with multiple communication methods.
                </p>
              </div>

              <div className="feature-modern">
                <div className="feature-number">04</div>
                <h3>Privacy First</h3>
                <p>
                  No recordings. No chat history. No data selling. Your conversations
                  exist only while you're connected.
                </p>
              </div>

              <div className="feature-modern">
                <div className="feature-number">05</div>
                <h3>Fast & Lightweight</h3>
                <p>
                  Optimized for all network speeds with adaptive video quality. Smooth
                  experience even on slower connections.
                </p>
              </div>

              <div className="feature-modern">
                <div className="feature-number">06</div>
                <h3>Built for Safety</h3>
                <p>
                  Live moderation, easy reporting, and automatic enforcement keep our
                  community respectful and safe.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Section */}
        <section className="safety-highlight">
          <div className="container">
            <div className="safety-content-box">
              <h2>Built for Safety & Respect</h2>
              <div className="safety-features-list">
                <div className="safety-feature-item">
                  <span className="check">✓</span>
                  <strong>18+ Only Platform</strong> - Age-verified community
                </div>
                <div className="safety-feature-item">
                  <span className="check">✓</span>
                  <strong>Live Moderation</strong> - AI-powered content monitoring
                </div>
                <div className="safety-feature-item">
                  <span className="check">✓</span>
                  <strong>Report & Ban System</strong> - Swift enforcement of rules
                </div>
                <div className="safety-feature-item">
                  <span className="check">✓</span>
                  <strong>Neutral Platform</strong> - No hate, violence, or harm
                </div>
              </div>
              <p className="peace-message">
                We do not support war, violence, or harm against any country or group.
                Olyx.site exists for peaceful, respectful communication only.
              </p>
              <Link to="/safety" className="btn btn-secondary">
                Learn About Safety
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta">
          <div className="container">
            <h2>Ready to Meet Real People?</h2>
            <p>Join thousands making meaningful connections every day</p>
            <Link to="/register" className="btn btn-primary btn-hero">
              Start Chatting Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
