import { Link } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function About() {
  return (
    <div className="public-page">
      <AnimatedBackground />
      <Header />

      <main className="public-content">
        <div className="content-page">
          <div className="container-narrow">
            <h1 className="page-title">About Olyx.site</h1>
            <p className="page-intro">
              Olyx.site was created to fix what random chat platforms broke.
            </p>

            <section className="content-section">
              <h2>The Problem We're Solving</h2>
              <p>
                Too many platforms became unsafe, filled with bots, fake users, and poor
                moderation. The original promise of connecting strangers for meaningful
                conversations was lost to spam, harassment, and privacy violations.
              </p>
              <p>We believe real conversations still matter.</p>
            </section>

            <section className="content-section">
              <h2>Our Mission</h2>
              <p>Our goal is simple:</p>
              <ul className="styled-list large">
                <li>Help people connect safely</li>
                <li>Protect user privacy</li>
                <li>Eliminate bots and fake behavior</li>
                <li>Create a respectful global community</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>How We're Different</h2>

              <div className="feature-box">
                <h3>Privacy-First Technology</h3>
                <p>
                  Unlike other platforms, we use peer-to-peer WebRTC connections. This
                  means your video and audio never touch our servers. Conversations exist
                  only between you and the person you're chatting with.
                </p>
              </div>

              <div className="feature-box">
                <h3>Real-Time Moderation</h3>
                <p>
                  AI-powered systems monitor for inappropriate content in real-time.
                  Violations are caught immediately, not after damage is done.
                </p>
              </div>

              <div className="feature-box">
                <h3>No Recordings, Ever</h3>
                <p>
                  We don't record video. We don't record audio. We don't store messages.
                  When you disconnect, everything disappears. No chat logs. No
                  surveillance. No data mining.
                </p>
              </div>

              <div className="feature-box">
                <h3>No Stored Conversations</h3>
                <p>
                  Text messages sent during video calls are transmitted peer-to-peer and
                  never stored anywhere. Complete privacy, complete control.
                </p>
              </div>
            </section>

            <section className="content-section">
              <h2>Built for Peaceful Communication</h2>
              <p>
                Olyx.site exists only for peaceful, respectful communication between
                people of different cultures and backgrounds.
              </p>
              <p className="highlight-text">
                We do not support war, violence, or harm against any country or group.
              </p>
              <p>
                Our platform is neutral ground for human connection, free from political
                agendas and ideological battles.
              </p>
            </section>

            <section className="content-section">
              <h2>Our Values</h2>

              <h3>Safety First</h3>
              <p>
                Every feature is designed with safety in mind. From AI moderation to easy
                reporting, we prioritize your security above all else.
              </p>

              <h3>Privacy Always</h3>
              <p>
                Your conversations are yours alone. We build with privacy-first
                architecture that makes surveillance impossible.
              </p>

              <h3>Real Humans Only</h3>
              <p>
                We aggressively combat bots, fake streams, and automated systems. Every
                connection should be authentic.
              </p>

              <h3>Global Community</h3>
              <p>
                With users from over 150 countries, we celebrate diversity and encourage
                cross-cultural understanding.
              </p>

              <h3>Transparency</h3>
              <p>
                We're open about how our platform works, what data we collect (almost
                none), and how we handle safety.
              </p>
            </section>

            <section className="content-section">
              <h2>The Technology</h2>
              <p>Olyx.site is built on modern, proven technologies:</p>
              <ul className="styled-list">
                <li>
                  <strong>WebRTC</strong> - Peer-to-peer video with no middleman
                </li>
                <li>
                  <strong>Real-time Matching</strong> - Connect in 2-3 seconds
                </li>
                <li>
                  <strong>AI Safety</strong> - Automatic inappropriate content detection
                </li>
                <li>
                  <strong>Adaptive Streaming</strong> - Quality adjusts to your
                  connection
                </li>
                <li>
                  <strong>Responsive Design</strong> - Perfect on mobile and desktop
                </li>
              </ul>
            </section>

            <section className="content-section">
              <h2>Free vs PRO</h2>

              <div className="comparison-grid">
                <div className="comparison-card">
                  <h3>Free</h3>
                  <ul className="styled-list">
                    <li>Unlimited video chat</li>
                    <li>Same-gender matching</li>
                    <li>Text chat included</li>
                    <li>Full safety features</li>
                    <li>Mobile & desktop</li>
                  </ul>
                  <p className="pricing-note">Perfect for casual connections</p>
                </div>

                <div className="comparison-card featured">
                  <div className="featured-badge">Popular</div>
                  <h3>PRO</h3>
                  <p className="price">$10/month</p>
                  <ul className="styled-list">
                    <li>Everything in Free</li>
                    <li>Gender filter</li>
                    <li>Region filter</li>
                    <li>Priority matching</li>
                    <li>Ad-free experience</li>
                  </ul>
                  <Link to="/pricing" className="btn btn-primary btn-sm">
                    Upgrade to PRO
                  </Link>
                </div>
              </div>
            </section>

            <section className="content-section">
              <h2>Community Guidelines</h2>
              <p>To maintain a safe and respectful environment:</p>
              <ul className="styled-list">
                <li>Be 18 years or older</li>
                <li>Treat others with respect</li>
                <li>Keep conversations appropriate</li>
                <li>Never share illegal content</li>
                <li>Report violations immediately</li>
                <li>Use real camera feeds only</li>
                <li>No harassment or threats</li>
              </ul>
              <p>
                Violations result in immediate disconnection and may lead to permanent
                bans. Learn more on our <Link to="/safety">Safety page</Link>.
              </p>
            </section>

            <section className="content-section">
              <h2>Our Commitment</h2>
              <p>We commit to:</p>
              <ul className="styled-list large">
                <li>Never recording your conversations</li>
                <li>Maintaining strict privacy standards</li>
                <li>Rapid response to safety reports</li>
                <li>Continuous platform improvements</li>
                <li>Transparent communication</li>
              </ul>
            </section>

            <div className="cta-box">
              <h3>Ready to Join?</h3>
              <p>
                Be part of a community that values safety, privacy, and authentic human
                connection.
              </p>
              <Link to="/register" className="btn btn-primary">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
