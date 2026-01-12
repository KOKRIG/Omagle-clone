import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <div className="legal-container">
      <div className="legal-content">
        <Link to="/" className="back-link">← Back to Home</Link>

        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: January 2024</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Olyx.site, you agree to be bound by these Terms
            of Service. If you do not agree to these terms, please do not use our
            service.
          </p>
        </section>

        <section>
          <h2>2. Service Description</h2>
          <p>
            Olyx.site provides a platform for random video and text chat between
            users. The service is designed for communication purposes only.
          </p>
        </section>

        <section>
          <h2>3. Eligibility</h2>
          <p>
            You must be at least 18 years old to use this service. By using
            Olyx.site, you confirm that you meet this age requirement.
          </p>
        </section>

        <section>
          <h2>4. User Conduct</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Display nudity or sexually explicit content</li>
            <li>Harass, threaten, or abuse other users</li>
            <li>Use the service for illegal purposes</li>
            <li>Transmit spam or malicious content</li>
            <li>Use virtual cameras or pre-recorded videos</li>
            <li>Attempt to collect personal information from other users</li>
            <li>Impersonate others or misrepresent your identity</li>
          </ul>
        </section>

        <section>
          <h2>5. Privacy & Recording Policy</h2>
          <p>
            <strong>Important:</strong> Olyx.site does NOT record, store, or
            monitor video, audio, or text chat content. All communications are
            peer-to-peer and exist only during the active session.
          </p>
          <p>
            Users are prohibited from recording, screenshotting, or otherwise
            capturing content from chat sessions.
          </p>
        </section>

        <section>
          <h2>6. Reporting & Moderation</h2>
          <p>
            Users can report inappropriate behavior. Reports are reviewed, and
            users who violate these terms may face temporary or permanent
            restrictions.
          </p>
          <p>
            Accounts receiving multiple reports will have reduced access to the
            platform.
          </p>
        </section>

        <section>
          <h2>7. Account Restrictions</h2>
          <p>
            Users who receive 10 or more reports will be placed in a restricted
            status for 14 days. Restricted users experience:
          </p>
          <ul>
            <li>Reduced match probability (1 in 10 attempts)</li>
            <li>Disabled filter features</li>
            <li>A visible "Restricted" status indicator</li>
          </ul>
        </section>

        <section>
          <h2>8. Subscription & Payments</h2>
          <p>
            PRO subscriptions are billed monthly through Stripe. You may cancel
            at any time, and your subscription will remain active until the end
            of the billing period.
          </p>
          <p>
            Refunds are available within 7 days of purchase if you are not
            satisfied with the service.
          </p>
        </section>

        <section>
          <h2>9. Platform Neutrality</h2>
          <p>
            Olyx.site is a neutral communication platform. We do not support
            war, violence, or harm against any country, group, or individual.
            We encourage peaceful and respectful communication.
          </p>
        </section>

        <section>
          <h2>10. Disclaimer of Warranties</h2>
          <p>
            The service is provided "as is" without warranties of any kind. We
            do not guarantee uninterrupted service or specific match outcomes.
          </p>
        </section>

        <section>
          <h2>11. Limitation of Liability</h2>
          <p>
            Olyx.site is not liable for any damages arising from your use of the
            service, including but not limited to direct, indirect, incidental,
            or consequential damages.
          </p>
        </section>

        <section>
          <h2>12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use
            of the service after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2>13. Contact</h2>
          <p>
            For questions about these terms, please contact us at
            support@olyx.site
          </p>
        </section>
      </div>
    </div>
  )
}
