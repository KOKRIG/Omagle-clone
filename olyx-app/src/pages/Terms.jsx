import { Link } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground'
import Header from '../components/Header'
import Footer from '../components/Footer'
import BannerAd from '../components/BannerAd'

export default function Terms() {
  return (
    <div className="public-page">
      <AnimatedBackground />
      <Header />

      <BannerAd />

      <main className="public-content">
        <div className="content-page">
          <div className="container-narrow">
            <h1 className="page-title">Terms & Conditions</h1>
            <p className="last-updated">Last updated: January 14, 2024</p>
            <p className="page-intro">
              Please read these terms carefully before using Olyx.site. By accessing or
              using our service, you agree to be bound by these terms.
            </p>

            <section className="content-section">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing, browsing, or using Olyx.site ("the Service"), you
                acknowledge that you have read, understood, and agree to be bound by these
                Terms & Conditions and our Privacy Policy.
              </p>
              <p>
                If you do not agree with any part of these terms, you must immediately
                cease using the Service.
              </p>
            </section>

            <section className="content-section">
              <h2>2. Eligibility</h2>
              <p>
                You must be <strong>at least 18 years of age</strong> to use Olyx.site.
                By using the Service, you represent and warrant that:
              </p>
              <ul className="styled-list">
                <li>You are 18 years or older</li>
                <li>You have the legal capacity to enter into binding contracts</li>
                <li>
                  You are not prohibited from using the Service under applicable law
                </li>
                <li>
                  You will comply with all local, state, national, and international laws
                </li>
              </ul>
              <p className="warning-text">
                Any user found to be under 18 will be permanently banned from the
                platform.
              </p>
            </section>

            <section className="content-section">
              <h2>3. User Responsibility</h2>
              <p>
                You are <strong>fully responsible</strong> for your behavior, conduct, and
                interactions while using Olyx.site. This includes:
              </p>
              <ul className="styled-list">
                <li>All content you transmit via video, audio, or text</li>
                <li>Your treatment of other users</li>
                <li>Compliance with community guidelines</li>
                <li>Protection of your own privacy and personal information</li>
                <li>Any consequences arising from your use of the Service</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>4. No Recording Policy</h2>
              <div className="important-box">
                <h3>Critical Privacy Information</h3>
                <p>
                  <strong>Olyx.site does NOT record, store, or monitor:</strong>
                </p>
                <ul className="styled-list">
                  <li>Video streams</li>
                  <li>Audio streams</li>
                  <li>Text chat messages</li>
                  <li>Conversation content of any kind</li>
                </ul>
                <p>
                  All communications use peer-to-peer WebRTC technology and exist only
                  during active sessions. When you disconnect, everything disappears
                  completely.
                </p>
              </div>
              <p>
                <strong>User Recording Prohibition:</strong> You are strictly prohibited
                from recording, screenshotting, or otherwise capturing content from chat
                sessions without explicit consent from all participants.
              </p>
            </section>

            <section className="content-section">
              <h2>5. Prohibited Conduct</h2>
              <p>Users may NOT engage in the following behaviors:</p>

              <h3>Content Violations</h3>
              <ul className="styled-list danger">
                <li>Displaying nudity or sexually explicit content</li>
                <li>Transmitting pornographic material</li>
                <li>Sharing violent or graphic content</li>
                <li>Broadcasting illegal activities</li>
              </ul>

              <h3>Behavioral Violations</h3>
              <ul className="styled-list danger">
                <li>Harassing, threatening, or abusing other users</li>
                <li>Bullying or intimidation</li>
                <li>Hate speech or discrimination</li>
                <li>Spamming or commercial solicitation</li>
                <li>Impersonating others or misrepresenting identity</li>
              </ul>

              <h3>Technical Violations</h3>
              <ul className="styled-list danger">
                <li>Using virtual cameras or pre-recorded videos</li>
                <li>Employing bots or automated systems</li>
                <li>Attempting to hack or compromise the Service</li>
                <li>Circumventing security measures</li>
                <li>Collecting personal information from other users</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>6. Reporting & Moderation</h2>
              <p>
                Olyx.site employs both automated and user-driven moderation systems:
              </p>

              <h3>User Reporting</h3>
              <p>
                Any user can report inappropriate behavior. Reports are taken seriously
                and reviewed promptly.
              </p>

              <h3>AI Moderation</h3>
              <p>
                Our AI systems automatically detect violations in real-time, including
                NSFW content, fake videos, and inappropriate text messages.
              </p>

              <h3>Enforcement</h3>
              <p>We reserve the right to:</p>
              <ul className="styled-list">
                <li>Immediately disconnect violating users</li>
                <li>Restrict or limit account features</li>
                <li>Temporarily suspend accounts</li>
                <li>Permanently ban repeat offenders</li>
                <li>Take legal action for severe violations</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>7. Account Restrictions & Bans</h2>

              <h3>Temporary Restrictions (14 Days)</h3>
              <p>
                Users who receive <strong>10 or more reports</strong> are automatically
                placed in restricted status for 14 days:
              </p>
              <ul className="styled-list">
                <li>Match probability reduced to 1 in 10 attempts</li>
                <li>All filter features disabled</li>
                <li>Visible "Restricted" status label</li>
                <li>Cannot access PRO features even if subscribed</li>
              </ul>

              <h3>Permanent Bans</h3>
              <p>Severe violations result in immediate permanent bans:</p>
              <ul className="styled-list">
                <li>Sexual or explicit content</li>
                <li>Illegal activities</li>
                <li>Repeated harassment</li>
                <li>Circumventing previous bans</li>
                <li>Underage usage</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>8. Subscription & Payments</h2>
              <h3>PRO Subscription</h3>
              <p>PRO subscriptions are billed monthly at $10/month through Stripe.</p>

              <h3>Billing Terms</h3>
              <ul className="styled-list">
                <li>Subscriptions auto-renew monthly unless canceled</li>
                <li>You may cancel at any time</li>
                <li>Access remains active until end of billing period</li>
                <li>No partial refunds for mid-cycle cancellations</li>
              </ul>

              <h3>Refund Policy</h3>
              <p>
                Refunds are available within <strong>7 days of purchase</strong> if you
                are not satisfied with the PRO features. After 7 days, all sales are
                final.
              </p>
            </section>

            <section className="content-section">
              <h2>9. Platform Neutrality</h2>
              <p>
                Olyx.site is a neutral communication platform. We explicitly{' '}
                <strong>do NOT support</strong>:
              </p>
              <ul className="styled-list">
                <li>War, military aggression, or armed conflict</li>
                <li>Violence against any country, group, or individual</li>
                <li>Hate, discrimination, or prejudice of any kind</li>
                <li>Political extremism or radicalization</li>
                <li>Terrorism or violent ideologies</li>
              </ul>
              <p>
                Our platform exists solely to facilitate peaceful, respectful human
                connection across borders and cultures.
              </p>
            </section>

            <section className="content-section">
              <h2>10. Disclaimer of Warranties</h2>
              <p>
                The Service is provided <strong>"AS IS"</strong> and{' '}
                <strong>"AS AVAILABLE"</strong> without warranties of any kind, either
                express or implied, including but not limited to:
              </p>
              <ul className="styled-list">
                <li>Merchantability</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Specific match outcomes or quality</li>
              </ul>
              <p>
                We do not guarantee that the Service will meet your requirements or that
                it will be available at all times.
              </p>
            </section>

            <section className="content-section">
              <h2>11. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Olyx.site and its operators,
                directors, employees, and affiliates shall NOT be liable for:
              </p>
              <ul className="styled-list">
                <li>
                  Any direct, indirect, incidental, special, or consequential damages
                </li>
                <li>Loss of profits, data, or goodwill</li>
                <li>Damages arising from your use or inability to use the Service</li>
                <li>Damages resulting from interactions with other users</li>
                <li>Unauthorized access to your account or data</li>
                <li>
                  Any content or conduct of third parties on the Service
                </li>
              </ul>
              <p className="warning-text">
                You use the Service entirely at your own risk. You are responsible for
                protecting your own privacy and safety.
              </p>
            </section>

            <section className="content-section">
              <h2>12. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Olyx.site and its
                operators from any claims, liabilities, damages, losses, or expenses
                (including legal fees) arising from:
              </p>
              <ul className="styled-list">
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another user or third party</li>
                <li>Your use or misuse of the Service</li>
                <li>Your breach of any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>13. Intellectual Property</h2>
              <p>
                All content, features, and functionality of Olyx.site, including but not
                limited to text, graphics, logos, software, and design, are owned by
                Olyx.site and protected by copyright, trademark, and other intellectual
                property laws.
              </p>
              <p>You may not:</p>
              <ul className="styled-list">
                <li>Copy, modify, or distribute our content</li>
                <li>Reverse engineer our software</li>
                <li>Use our branding without permission</li>
                <li>Create derivative works</li>
              </ul>
            </section>

            <section className="content-section">
              <h2>14. Termination</h2>
              <p>
                We reserve the right to terminate or suspend your access to the Service
                immediately, without prior notice or liability, for any reason, including
                but not limited to:
              </p>
              <ul className="styled-list">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Harm to other users or the platform</li>
                <li>At our sole discretion</li>
              </ul>
              <p>
                Upon termination, your right to use the Service will immediately cease. No
                refunds will be provided for terminated accounts.
              </p>
            </section>

            <section className="content-section">
              <h2>15. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws
                of the jurisdiction in which Olyx.site operates, without regard to its
                conflict of law provisions.
              </p>
            </section>

            <section className="content-section">
              <h2>16. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time at our
                sole discretion. Changes will be effective immediately upon posting to the
                Service.
              </p>
              <p>
                Your continued use of the Service after any changes constitutes acceptance
                of the new Terms. We encourage you to review these Terms periodically.
              </p>
            </section>

            <section className="content-section">
              <h2>17. Severability</h2>
              <p>
                If any provision of these Terms is found to be unenforceable or invalid,
                that provision will be limited or eliminated to the minimum extent
                necessary, and the remaining provisions will remain in full force and
                effect.
              </p>
            </section>

            <section className="content-section">
              <h2>18. Entire Agreement</h2>
              <p>
                These Terms, along with our Privacy Policy, constitute the entire
                agreement between you and Olyx.site regarding the use of the Service.
              </p>
            </section>

            <section className="content-section">
              <h2>19. Contact</h2>
              <p>
                For questions, concerns, or issues regarding these Terms, please contact
                us at:
              </p>
              <p className="contact-info">support@olyx.site</p>
            </section>

            <div className="acceptance-box">
              <h3>By Using Olyx.site, You Agree To:</h3>
              <ul className="styled-list">
                <li>All terms and conditions stated above</li>
                <li>Our Privacy Policy</li>
                <li>Our Community Guidelines</li>
                <li>Respectful, legal, and appropriate behavior</li>
              </ul>
              <Link to="/register" className="btn btn-primary">
                I Accept - Create Account
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
