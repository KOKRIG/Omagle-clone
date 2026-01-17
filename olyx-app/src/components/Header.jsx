import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="public-header">
      <div className="header-container">
        <Link to="/" className="header-logo gradient-text">
          Olyx.site
        </Link>

        <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
            About
          </Link>
          <Link to="/safety" onClick={() => setMobileMenuOpen(false)}>
            Safety
          </Link>
          <Link to="/terms" onClick={() => setMobileMenuOpen(false)}>
            Terms
          </Link>
        </nav>

        <div className="header-actions">
          <Link to="/login" className="btn btn-text">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Start Chatting
          </Link>
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  )
}
