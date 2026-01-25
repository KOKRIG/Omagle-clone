import { Link } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BannerAd from '../components/BannerAd'

export default function Safety() {
  return (
    <div className="public-page">
      <AnimatedBackground />
      <Header />

      <BannerAd />

      <main className="public-content">
        <div className="content-page">
          <div className="container-narrow">
            <h1 className="page-title">Safety & Community Standards</h1>
            <p className="page-intro">
              Your safety is our top priority. Olyx.site is built with comprehensive
              safety features and strict community guidelines to ensure a respectful,
              secure environment for all users.
            </p>

            <section className="content-section">
              <h2>Age Requirement</h2>
              <p>
                Olyx.site is strictly an <strong>18+ platform</strong>. By creating an
                account, you confirm that you are at least 18 years of age. We employ
                multiple safeguards to prevent underage access.
              </p>
              <p>
                Anyone found to be under 18 will be permanently banned from the
                platform.
              </p>
            </section>

            <section className="content-section">
              <h2>Expected Behavior</h2>
              <p>
                All users must conduct themselves with respect and dignity. We expect:
              </p>
              <ul className="styled-list">
                <li>Respectful communication at all times</li>
                <li>Appropriate attire and behavior on camera</li>
                <li>No harassment, threats, or intimidation</li>
                <li>No discrimination based on race, gender, religion, or nationality</li>
                <li>Honest representation (no fake videos or virtual cameras)</li>
                <li>Compliance with all terms and community guidelines</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>Zero Tolerance Policies</h2>
              <p>The following behaviors result in immediate account termination:</p>
              <ul className="styled-list danger">
                <li>Sexual content or nudity</li>
                <li>Harassment or bullying</li>
                <li>Hate speech or discrimination</li>
                <li>Violence or threats of violence</li>
                <li>Illegal activities</li>
                <li>Spam or commercial solicitation</li>
                <li>Sharing personal information of others</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>Reporting System</h2>
              <p>
                Every user has the power to report inappropriate behavior. When you
                report someone:
              </p>
              <ol className="styled-list">
                <li>Your report is logged immediately</li>
                <li>The reported user's behavior is reviewed</li>
                <li>Action is taken based on severity and frequency</li>
                <li>You remain anonymous throughout the process</li>
              </ol>
              <div className="info-box">
                <strong>Automatic Enforcement:</strong> Users who receive 10 reports are
                automatically restricted for 14 days. During this time, their match
                probability is reduced to 1 in 10 attempts, and all filters are
                disabled.
              </div>
            </section>

            <section className="content-section">
              <h2>Temporary & Permanent Bans</h2>
              <h3>Temporary Restrictions</h3>
              <p>
                Users with multiple reports receive temporary restrictions, including:
              </p>
              <ul className="styled-list">
                <li>Reduced matching probability</li>
                <li>Disabled filter features</li>
                <li>Visible "Restricted" status label</li>
                <li>14-day duration</li>
              </ul>

              <h3>Permanent Bans</h3>
              <p>Severe violations or repeated offenses result in permanent bans:</p>
              <ul className="styled-list">
                <li>Account permanently disabled</li>
                <li>Email address blocked from re-registration</li>
                <li>No appeals for serious violations</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>No Recording Policy</h2>
              <p className="highlight-text">
                This is critical: Olyx.site does NOT record, store, or monitor video,
                audio, or text messages.
              </p>
              <p>All communications are peer-to-peer and exist only during the call.</p>
              <p>
                When you disconnect, everything disappears. We have no servers storing
                your conversations.
              </p>
              <div className="warning-box">
                <strong>Important:</strong> While WE don't record, we cannot prevent
                other users from recording their screens. Always behave as if you're
                being recorded, and never share sensitive personal information.
              </div>
            </section>

            <section className="content-section">
              <h2>AI Moderation</h2>
              <p>
                We use advanced AI systems to detect inappropriate content in real-time:
              </p>
              <ul className="styled-list">
                <li>NSFW content detection</li>
                <li>Fake video stream identification</li>
                <li>Frozen frame detection</li>
                <li>Text message moderation for harmful content</li>
              </ul>
              <p>
                When violations are detected, connections are immediately terminated and
                automatic reports are generated.
              </p>
            </section>

            <section className="content-section">
              <h2>Platform Neutrality</h2>
              <p>
                Olyx.site maintains strict political and ideological neutrality. We{' '}
                <strong>do not support</strong>:
              </p>
              <ul className="styled-list">
                <li>War or military aggression</li>
                <li>Violence against any country or group</li>
                <li>Hate or discrimination of any kind</li>
                <li>Political extremism</li>
              </ul>
              <p>
                Our platform exists solely to facilitate peaceful, respectful human
                connection across borders and cultures.
              </p>
            </section>

            <section className="content-section">
              <h2>Your Responsibility</h2>
              <p>While we provide safety tools, you are responsible for:</p>
              <ul className="styled-list">
                <li>Protecting your own privacy</li>
                <li>Reporting inappropriate behavior immediately</li>
                <li>Disconnecting from uncomfortable situations</li>
                <li>Not sharing personal information</li>
                <li>Behaving respectfully toward others</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>Safety Tips</h2>
              <div className="tips-grid">
                <div className="tip-card">
                  <h4>Protect Your Identity</h4>
                  <p>Never share your full name, address, phone number, or email</p>
                </div>
                <div className="tip-card">
                  <h4>Trust Your Instincts</h4>
                  <p>If something feels wrong, skip immediately and report</p>
                </div>
                <div className="tip-card">
                  <h4>Stay Appropriate</h4>
                  <p>Keep conversations and behavior safe for work</p>
                </div>
                <div className="tip-card">
                  <h4>Use Reports</h4>
                  <p>Don't hesitate to report violations, no matter how small</p>
                </div>
              </div>
            </section>

            <div className="cta-box">
              <h3>Questions About Safety?</h3>
              <p>
                Review our <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link> for complete information.
              </p>
              <Link to="/register" className="btn btn-primary">
                Join Safe Community
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
