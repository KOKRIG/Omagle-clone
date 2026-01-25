import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BannerAd from '../components/BannerAd'
import VerticalBannerAd from '../components/VerticalBannerAd'

export default function Landing() {
  useEffect(() => {
    const popunderScript = document.createElement('script')
    popunderScript.src = 'https://pl28564266.effectivegatecpm.com/e8/a8/8e/e8a88ef3b2c76db8a7ce2199d6df5941.js'
    document.head.appendChild(popunderScript)

    return () => {
      if (popunderScript.parentNode) {
        popunderScript.parentNode.removeChild(popunderScript)
      }
    }
  }, [])

  return (
    <div className="public-page">
      <Header />

      <main className="public-content">
        {/* Horizontal Banner Ad at Top */}
        <section style={{ padding: '2rem 0', display: 'flex', justifyContent: 'center', background: 'rgba(14, 165, 233, 0.05)' }}>
          <BannerAd />
        </section>

        {/* Main Content with Side Ads */}
        <div style={{ display: 'flex', gap: '1rem', maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
          {/* Left Vertical Ad */}
          <div style={{ flex: '0 0 160px', display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
            <VerticalBannerAd />
          </div>

          {/* Center Content */}
          <div style={{ flex: '1', minWidth: 0 }}>
            {/* Hero Section */}
            <section className="hero">
              <div className="container hero-container">
                <h1 className="hero-title fade-in">
                  Free Random Video Chat
                  <br />
                  Best Omegle Alternative
                </h1>
                <p className="hero-subtitle fade-in delay-1">
                  Connect with strangers worldwide through video call and text chat.
                  <br />
                  No bots. No recordings. 100% private and secure.
                </p>
                <div className="hero-cta fade-in delay-2">
                  <Link to="/register" className="btn btn-primary btn-hero">
                    Start Video Chat Free
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
                <h2 className="section-title">The Best Free Video Chat Platform for Meeting Strangers</h2>

                <div className="features-grid-modern">
                  <div className="feature-modern">
                    <div className="feature-number">01</div>
                    <h3>Random Video Call Matching</h3>
                    <p>
                      Instantly connect with random strangers for video calls. Choose gender preferences to chat with girls or guys. Advanced filters for premium users.
                    </p>
                  </div>

                  <div className="feature-modern">
                    <div className="feature-number">02</div>
                    <h3>Bot-Free Video Chat</h3>
                    <p>
                      Talk to real people only. Our advanced detection systems block bots, fake streams, and recordings to ensure authentic stranger video calls.
                    </p>
                  </div>

                  <div className="feature-modern">
                    <div className="feature-number">03</div>
                    <h3>Video Call + Text Chat</h3>
                    <p>
                      Combine face-to-face video calls with instant text messaging. Meet new people and build connections through multiple chat methods.
                    </p>
                  </div>

                  <div className="feature-modern">
                    <div className="feature-number">04</div>
                    <h3>100% Private Stranger Chat</h3>
                    <p>
                      No recordings. No chat logs. No data collection. Your random video calls remain completely private and secure with peer-to-peer connections.
                    </p>
                  </div>

                  <div className="feature-modern">
                    <div className="feature-number">05</div>
                    <h3>Fast Video Chat Experience</h3>
                    <p>
                      Lightning-fast connections for smooth video calls. Adaptive quality for all internet speeds. Works perfectly on mobile and desktop.
                    </p>
                  </div>

                  <div className="feature-modern">
                    <div className="feature-number">06</div>
                    <h3>Safe Stranger Video Platform</h3>
                    <p>
                      AI-powered moderation, one-click reporting, and strict community guidelines ensure safe video chats with strangers worldwide.
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
                <h2>Start Free Video Chat with Strangers Now</h2>
                <p>Join thousands of people worldwide making real connections through random video calls daily. No registration required to start.</p>
                <Link to="/register" className="btn btn-primary btn-hero">
                  Start Random Video Chat
                </Link>
              </div>
            </section>

            {/* SEO Content Section */}
            <section className="features" style={{ paddingTop: '2rem' }}>
              <div className="container">
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                  <h2 className="section-title">Why Olyx is the Best Omegle Alternative</h2>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '2rem' }}>
                    <p style={{ marginBottom: '1rem' }}>
                      Looking for a free video chat platform to meet new people? Olyx is the leading Omegle alternative for random video calls with strangers worldwide. Whether you want to video chat with girls, connect with guys, or simply talk to strangers online, our platform offers the best experience for random video calls.
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                      Unlike other video chat sites, Olyx provides authentic stranger connections with advanced bot detection, ensuring you only video call with real people. Our platform supports both random video chat and text chat simultaneously, making it easy to build genuine connections with strangers from around the world.
                    </p>
                    <p style={{ marginBottom: '1rem' }}>
                      With gender filtering options, you can choose to video chat with girls or guys based on your preferences. Premium users get access to region filters and priority matching for even better stranger video call experiences. All video chats are 100% private with no recordings or data collection.
                    </p>
                    <p>
                      Start your free video chat journey today. No download required, no registration needed for browsing. Simply click start and connect with random strangers for instant video calls. Experience the best Omegle alternative for meeting new people through safe, secure, and private video chat.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Vertical Ad */}
          <div style={{ flex: '0 0 160px', display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
            <VerticalBannerAd />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
