import { Link } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BannerAd from '../components/BannerAd'
import NativeAd from '../components/NativeAd'

export default function Privacy() {
  return (
    <div className="public-page">
      <AnimatedBackground />
      <Header />

      <BannerAd />

      <main className="public-content">
        <div className="content-page">
          <div className="container-narrow">
            <h1 className="page-title">Privacy Policy</h1>
            <p className="last-updated">Last updated: January 14, 2024</p>
            <p className="page-intro">
              At Olyx.site, your privacy is our highest priority. This policy explains
              what information we collect, how we use it, and your rights regarding your
              data.
            </p>

            <section className="content-section">
              <h2>1. Introduction</h2>
              <p>
                We believe in radical transparency about privacy. This policy is written
                in plain English, not legal jargon, so you can understand exactly what we
                do and don't do with your information.
              </p>
            </section>

            <section className="content-section">
              <h2>2. Information We Collect</h2>

              <h3>Account Information</h3>
              <ul className="styled-list">
                <li>Email address (Gmail only for verification purposes)</li>
                <li>Full name</li>
                <li>Gender (for matching preferences)</li>
                <li>Country/Region (for regional matching)</li>
                <li>Security question and hashed answer (for password recovery)</li>
              </ul>

              <h3>Usage Information</h3>
              <ul className="styled-list">
                <li>Login timestamps</li>
                <li>Subscription status (Free or PRO)</li>
                <li>Filter preferences (gender and region)</li>
                <li>Report count summary (not report details)</li>
                <li>Ban status and expiry date (if applicable)</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>3. Information We Do NOT Collect</h2>
              <div className="important-box">
                <h3>Critical Privacy Guarantee</h3>
                <p>
                  <strong>We explicitly do NOT collect, store, or monitor:</strong>
                </p>
                <ul className="styled-list">
                  <li>Video streams or recordings</li>
                  <li>Audio streams or recordings</li>
                  <li>Text chat messages</li>
                  <li>Screenshots or captures</li>
                  <li>IP addresses during chat sessions</li>
                  <li>Conversation content of any kind</li>
                </ul>
                <p>
                  All video and text communications use peer-to-peer (WebRTC) technology
                  and exist only during active sessions. When you disconnect, everything
                  disappears permanently.
                </p>
              </div>
            </section>

            <section className="content-section">
              <h2>4. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="styled-list">
                <li>Provide and maintain the Service</li>
                <li>Create and manage your account</li>
                <li>Process subscription payments (via Stripe)</li>
                <li>Match you with compatible users</li>
                <li>Enforce community guidelines and safety rules</li>
                <li>Improve user experience and platform functionality</li>
                <li>Send service-related communications only (no marketing)</li>
              </ul>
              <p className="highlight-text">
                We never sell, rent, or share your personal information with third parties
                for marketing purposes.
              </p>
            </section>

            <section className="content-section">
              <h2>5. Data Storage & Security</h2>
              <p>
                Your account data is stored securely in Supabase (PostgreSQL database)
                with encryption at rest (AES-256) and in transit (TLS 1.3).
              </p>
              <p>
                Passwords are handled by Supabase Auth and are never stored in plain text.
                We use industry-standard bcrypt hashing. Security question answers are
                also hashed before storage.
              </p>
            </section>

            <section className="content-section">
              <h2>6. Third-Party Services</h2>
              <p>We use the following trusted third-party services:</p>
              <ul className="styled-list">
                <li>
                  <strong>Supabase:</strong> Database and authentication (SOC 2 Type II
                  certified, GDPR compliant)
                </li>
                <li>
                  <strong>Stripe:</strong> Payment processing (PCI Level 1 certified)
                </li>
                <li>
                  <strong>Netlify:</strong> Web hosting and content delivery
                </li>
              </ul>
              <p>
                These services have their own privacy policies, which we encourage you to
                review.
              </p>
            </section>

            <section className="content-section">
              <h2>7. Cookies & Tracking</h2>
              <p>
                We use <strong>essential cookies only</strong> for authentication and
                session management. We do NOT use tracking cookies, analytics, or
                third-party advertising cookies.
              </p>
            </section>

            <section className="content-section">
              <h2>8. Your Privacy Rights</h2>
              <p>You have the right to:</p>
              <ul className="styled-list">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your account</li>
                <li>Export your data</li>
                <li>Opt out of non-essential communications</li>
                <li>Object to data processing</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>9. Data Retention</h2>
              <p>
                We retain your account data as long as your account is active. If you
                delete your account, your data will be permanently removed within 30 days.
              </p>
            </section>

            <section className="content-section">
              <h2>10. Children's Privacy</h2>
              <p>
                Our Service is <strong>strictly 18+ only</strong>. We do not knowingly
                collect information from anyone under 18 years of age.
              </p>
            </section>

            <section className="content-section">
              <h2>11. International Users</h2>
              <p>
                If you access the Service from outside the United States, your data may be
                transferred to and processed in the United States. We comply with GDPR
                requirements for EU users.
              </p>
            </section>

            <section className="content-section">
              <h2>12. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. We will notify you of
                significant changes via email or through the Service.
              </p>
            </section>

            <section className="content-section">
              <h2>13. Contact Us</h2>
              <p>
                For privacy-related questions or requests, please contact us at:
              </p>
              <p className="contact-info">privacy@olyx.site</p>
              <p>We will respond to all legitimate requests within 30 days.</p>
            </section>

            <NativeAd />

            <div className="summary-box">
              <h3>Privacy Summary</h3>
              <ul className="styled-list large">
                <li>✓ We never record video or audio</li>
                <li>✓ We never store chat messages</li>
                <li>✓ We never sell your data</li>
                <li>✓ We use minimal tracking (essential cookies only)</li>
                <li>✓ You have full control over your data</li>
                <li>✓ We're transparent about everything we do</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
