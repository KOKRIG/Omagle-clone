import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <Link to="/" className="back-link">← Back to Home</Link>

        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: January 2024</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            At Olyx.site, we take your privacy seriously. This policy explains
            what information we collect, how we use it, and your rights
            regarding your data.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>Account Information</h3>
          <ul>
            <li>Email address (Gmail only)</li>
            <li>Full name</li>
            <li>Gender</li>
            <li>Country/Region</li>
            <li>Security question and hashed answer</li>
          </ul>

          <h3>Usage Information</h3>
          <ul>
            <li>Login timestamps</li>
            <li>Subscription status</li>
            <li>Filter preferences</li>
            <li>Report history (summary only)</li>
          </ul>
        </section>

        <section>
          <h2>3. Information We Do NOT Collect</h2>
          <p>
            <strong>We explicitly do NOT collect, store, or monitor:</strong>
          </p>
          <ul>
            <li>Video streams or recordings</li>
            <li>Audio streams or recordings</li>
            <li>Text chat messages</li>
            <li>Screenshots or captures</li>
            <li>IP addresses of chat participants</li>
          </ul>
          <p>
            All video and text communications are peer-to-peer (WebRTC) and
            exist only during active sessions. Nothing is stored on our servers.
          </p>
        </section>

        <section>
          <h2>4. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide and maintain the service</li>
            <li>Process subscription payments</li>
            <li>Enforce community guidelines</li>
            <li>Improve the user experience</li>
            <li>Send service-related communications</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Storage & Security</h2>
          <p>
            Your account data is stored securely in Supabase (PostgreSQL) with
            encryption at rest and in transit. We use industry-standard security
            measures to protect your information.
          </p>
          <p>
            Passwords are handled by Supabase Auth and are never stored in
            plain text. Security question answers are hashed before storage.
          </p>
        </section>

        <section>
          <h2>6. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li>
              <strong>Supabase:</strong> Database and authentication
            </li>
            <li>
              <strong>Stripe:</strong> Payment processing
            </li>
            <li>
              <strong>Netlify:</strong> Web hosting
            </li>
          </ul>
          <p>
            These services have their own privacy policies. We recommend
            reviewing them.
          </p>
        </section>

        <section>
          <h2>7. Cookies</h2>
          <p>
            We use essential cookies only for authentication and session
            management. We do not use tracking cookies or third-party analytics.
          </p>
        </section>

        <section>
          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your account</li>
            <li>Export your data</li>
            <li>Opt out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2>9. Data Retention</h2>
          <p>
            We retain your account data as long as your account is active. If
            you delete your account, your data will be permanently removed
            within 30 days.
          </p>
        </section>

        <section>
          <h2>10. Children's Privacy</h2>
          <p>
            Our service is not intended for users under 18 years of age. We do
            not knowingly collect information from minors.
          </p>
        </section>

        <section>
          <h2>11. International Users</h2>
          <p>
            If you are accessing the service from outside the United States,
            please note that your data may be transferred to and processed in
            the United States.
          </p>
        </section>

        <section>
          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of
            significant changes via email or through the service.
          </p>
        </section>

        <section>
          <h2>13. Contact Us</h2>
          <p>
            For privacy-related questions or requests, please contact us at
            privacy@olyx.site
          </p>
        </section>
      </div>
    </div>
  )
}
