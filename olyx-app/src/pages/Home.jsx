import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const PRO_EMAILS = ['taranjitkokri420@gmail.com', 'studio54code@gmail.com']

export default function Home() {
  const navigate = useNavigate()
  const { user, profile, signOut, setProfile } = useAuth()

  const [filters, setFilters] = useState({
    gender: 'any',
    region: '',
  })
  const [isBanned, setIsBanned] = useState(false)
  const [banExpiry, setBanExpiry] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeUsers, setActiveUsers] = useState(0)
  const [showPermissionModal, setShowPermissionModal] = useState(false)

  const isPro = profile?.is_paid || PRO_EMAILS.includes(profile?.email?.toLowerCase())

  useEffect(() => {
    if (profile) {
      if (profile.ban_until && new Date(profile.ban_until) > new Date()) {
        setIsBanned(true)
        setBanExpiry(profile.ban_until)
      }

      checkBillingStatus()

      if (profile.filter_gender) {
        setFilters((prev) => ({ ...prev, gender: profile.filter_gender }))
      }
      if (profile.filter_region) {
        setFilters((prev) => ({ ...prev, region: profile.filter_region }))
      }

      supabase.from('profiles').update({ presence: 'online' }).eq('id', user.id)
    }
  }, [profile])

  useEffect(() => {
    const fetchActiveUsers = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('presence', ['online', 'searching', 'in_chat'])
      setActiveUsers(count || 0)
    }

    fetchActiveUsers()
    const interval = setInterval(fetchActiveUsers, 30000)

    return () => clearInterval(interval)
  }, [])

  const checkBillingStatus = async () => {
    if (PRO_EMAILS.includes(profile?.email?.toLowerCase())) return
    if (!profile?.is_paid) return

    const nextBilling = profile.next_billing
    if (nextBilling && new Date(nextBilling) < new Date()) {
      const { error } = await supabase
        .from('profiles')
        .update({ is_paid: false })
        .eq('id', user.id)

      if (!error) {
        setProfile({ ...profile, is_paid: false })
      }
    }
  }

  const handleFilterChange = async (key, value) => {
    if (!isPro) return

    setFilters((prev) => ({ ...prev, [key]: value }))

    const update = key === 'gender' ? { filter_gender: value } : { filter_region: value }
    await supabase.from('profiles').update(update).eq('id', user.id)
  }

  const handleStartChat = () => {
    if (isBanned) return
    setShowPermissionModal(true)
  }

  const handlePermissionGranted = async () => {
    setShowPermissionModal(false)
    setLoading(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      stream.getTracks().forEach((track) => track.stop())

      await supabase
        .from('profiles')
        .update({ presence: 'searching' })
        .eq('id', user.id)

      navigate('/chat', { state: { filters } })
    } catch (err) {
      alert('Camera and microphone access is required to use Olyx.site')
      console.error('Failed to get permissions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase
      .from('profiles')
      .update({ presence: 'offline' })
      .eq('id', user.id)

    await signOut()
    navigate('/login')
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <Link to="/" className="dashboard-logo gradient-text">
          Olyx.site
        </Link>
        <div className="dashboard-nav">
          <div className="active-indicator">
            <span className="pulse-dot"></span>
            <span>{activeUsers} online</span>
          </div>
          <Link to="/pricing" className="nav-link">Pricing</Link>
          <button onClick={handleLogout} className="nav-link logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <div className="main-action-card">
            <div className="card-glow"></div>
            <div className="card-content">
              <h1>Ready to Connect?</h1>
              <p>Meet real people from around the world. No bots, no recordings - just authentic conversations.</p>

              <button
                onClick={handleStartChat}
                className="start-chat-btn"
                disabled={loading || isBanned}
              >
                {loading ? (
                  <span className="btn-loading">Starting...</span>
                ) : (
                  <>
                    <span className="btn-icon">&#9654;</span>
                    <span>Start Chatting</span>
                  </>
                )}
              </button>

              {isBanned && (
                <div className="restriction-notice">
                  Account restricted until {new Date(banExpiry).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div className="side-cards">
            <div className="info-card profile-card-new">
              <div className="card-header">
                <h3>Your Profile</h3>
                {isPro ? (
                  <span className="pro-badge">PRO</span>
                ) : (
                  <span className="free-badge">FREE</span>
                )}
              </div>
              <div className="profile-details">
                <div className="detail-row">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{profile?.full_name || 'Not set'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Country</span>
                  <span className="detail-value">{profile?.country || 'Not set'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Chats</span>
                  <span className="detail-value">{profile?.match_count || 0}</span>
                </div>
              </div>
              {!isPro && (
                <Link to="/pricing" className="upgrade-link">
                  Upgrade to PRO
                </Link>
              )}
            </div>

            <div className="info-card filters-card">
              <div className="card-header">
                <h3>Filters</h3>
                {!isPro && <span className="lock-icon">Locked</span>}
              </div>

              <div className={`filters-content ${!isPro ? 'filters-locked' : ''}`}>
                <div className="filter-item">
                  <label>Gender Preference</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                    disabled={!isPro || isBanned}
                  >
                    <option value="any">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="filter-item">
                  <label>Region</label>
                  <select
                    value={filters.region}
                    onChange={(e) => handleFilterChange('region', e.target.value)}
                    disabled={!isPro || isBanned}
                  >
                    <option value="">Any Region</option>
                    <option value="United States">United States</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="Japan">Japan</option>
                    <option value="Korea">Korea</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {!isPro && (
                  <div className="filters-overlay">
                    <Link to="/pricing">Unlock with PRO</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="features-row">
          <div className="feature-item">
            <div className="feature-icon">&#128274;</div>
            <span>End-to-End Private</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">&#128683;</div>
            <span>No Recording</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">&#129302;</div>
            <span>AI Moderated</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">&#128100;</div>
            <span>Real People Only</span>
          </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <div className="footer-links">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/safety">Safety</Link>
        </div>
        <p>We promote peaceful communication worldwide.</p>
      </footer>

      {showPermissionModal && (
        <div className="modal-overlay">
          <div className="permission-modal-new">
            <div className="modal-icon">&#127909;</div>
            <h3>Camera & Mic Required</h3>
            <p>
              To chat on Olyx.site, we need access to your camera and microphone.
              We never record or store any calls.
            </p>
            <div className="modal-btns">
              <button onClick={() => setShowPermissionModal(false)} className="modal-btn-cancel">
                Cancel
              </button>
              <button onClick={handlePermissionGranted} className="modal-btn-allow">
                Allow & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
