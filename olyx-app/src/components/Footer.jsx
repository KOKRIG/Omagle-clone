import { Link } from 'react-router-dom'
import logoImg from '../assets/files_5142184-1768654930960-fe0bd809-6bc1-479e-932e-5902ff8d803b.png'

export default function Footer() {
  return (
    <footer className="public-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <img src={logoImg} alt="Olyx" className="footer-logo-img" />
            <p className="footer-tagline">
              Real people. No bots. No recordings.
              <br />
              Just safe, meaningful conversations.
            </p>
          </div>

          <div className="footer-section">
            <h4>Platform</h4>
            <ul>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/safety">Safety</Link>
              </li>
              <li>
                <Link to="/pricing">Pricing</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li>
                <Link to="/terms">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Safety</h4>
            <ul>
              <li>18+ Only</li>
              <li>No Recording</li>
              <li>AI Moderated</li>
              <li>Report System</li>
            </ul>
          </div>
        </div>

        <div className="footer-disclaimer">
          <p>
            <strong>Privacy Guarantee:</strong> Olyx.site does not record or store
            video, audio, or messages. All conversations are peer-to-peer and exist
            only during active sessions.
          </p>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; 2024 Olyx.site - We promote peaceful communication. We do not
            support war, violence, or harm against any country or group.
          </p>
        </div>
      </div>
    </footer>
  )
}
