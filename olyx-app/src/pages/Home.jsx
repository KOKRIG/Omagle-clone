import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

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
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  useEffect(() => {
    if (profile) {
      // Check ban status
      if (profile.ban_until && new Date(profile.ban_until) > new Date()) {
        setIsBanned(true)
        setBanExpiry(profile.ban_until)
      }

      // Check billing status
      checkBillingStatus()

      // Load saved filters
      if (profile.filter_gender) {
        setFilters((prev) => ({ ...prev, gender: profile.filter_gender }))
      }
      if (profile.filter_region) {
        setFilters((prev) => ({ ...prev, region: profile.filter_region }))
      }

      // Update presence to online
      supabase.from('profiles').update({ presence: 'online' }).eq('id', user.id)
    }
  }, [profile])

  // Fetch active users count
  useEffect(() => {
    const fetchActiveUsers = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('presence', ['online', 'searching', 'in_chat'])
      setActiveUsers(count || 0)
    }

    fetchActiveUsers()
    const interval = setInterval(fetchActiveUsers, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const checkBillingStatus = async () => {
    if (!profile?.is_paid) return

    const nextBilling = profile.next_billing
    if (nextBilling && new Date(nextBilling) < new Date()) {
      // Billing expired - downgrade to free
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
    if (!profile?.is_paid) return

    setFilters((prev) => ({ ...prev, [key]: value }))

    // Save filter preferences
    const update = key === 'gender' ? { filter_gender: value } : { filter_region: value }
    await supabase.from('profiles').update(update).eq('id', user.id)
  }

  const handleStartChat = () => {
    if (isBanned) {
      return
    }
    setShowPermissionModal(true)
  }

  const handlePermissionGranted = async () => {
    setShowPermissionModal(false)
    setLoading(true)

    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      // Stop the stream immediately (we just needed permission)
      stream.getTracks().forEach((track) => track.stop())

      // Update presence to searching
      await supabase
        .from('profiles')
        .update({ presence: 'searching' })
        .eq('id', user.id)

      // Navigate to chat page
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

  const getPlanBadge = () => {
    if (profile?.is_paid) {
      return <span className="badge badge-pro">PRO</span>
    }
    return <span className="badge badge-free">FREE</span>
  }

  const getStatusBadge = () => {
    if (isBanned) {
      return <span className="badge badge-restricted">RESTRICTED</span>
    }
    return null
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="logo">Olyx.site</h1>
        <div className="active-users">Active now: {activeUsers} users</div>
        <nav className="nav-links">
          <Link to="/pricing">Pricing</Link>
          <button onClick={handleLogout} className="btn btn-text">
            Logout
          </button>
        </nav>
      </header>

      <main className="home-main">
        <div className="welcome-section">
          <h2>Connect with People Worldwide</h2>
          <p className="privacy-notice">
            We do not record or store video, audio, or messages. Your privacy is our priority.
          </p>
        </div>

        <div className="action-section-top">
          <button
            onClick={handleStartChat}
            className="btn btn-primary btn-hero"
            disabled={loading}
          >
            {loading ? 'Starting...' : 'START CHAT'}
          </button>

          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="btn btn-secondary btn-hero"
          >
            FILTERS {!profile?.is_paid && '🔒'}
          </button>
        </div>

        <div className="profile-card">
          <h3>Your Profile</h3>
          <div className="profile-info">
            <div className="profile-row">
              <span className="label">Email:</span>
              <span className="value">{profile?.email}</span>
            </div>
            <div className="profile-row">
              <span className="label">Name:</span>
              <span className="value">{profile?.full_name}</span>
            </div>
            <div className="profile-row">
              <span className="label">Country:</span>
              <span className="value">{profile?.country}</span>
            </div>
            <div className="profile-row">
              <span className="label">Plan:</span>
              <span className="value">{getPlanBadge()}</span>
            </div>
            {getStatusBadge() && (
              <div className="profile-row">
                <span className="label">Status:</span>
                <span className="value">{getStatusBadge()}</span>
              </div>
            )}
            {profile?.is_paid && profile?.next_billing && (
              <div className="profile-row">
                <span className="label">Next Billing:</span>
                <span className="value">
                  {new Date(profile.next_billing).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {isBanned && (
          <div className="ban-notice">
            <h3>Account Restricted</h3>
            <p>
              Your account has been restricted due to multiple reports.
              Restrictions will be lifted on{' '}
              {new Date(banExpiry).toLocaleDateString()}.
            </p>
            <p>While restricted:</p>
            <ul>
              <li>Match probability reduced (1 in 10 attempts)</li>
              <li>Filters disabled</li>
            </ul>
          </div>
        )}

        {showFilterPanel && (
          <div className="filters-panel">
            <h3>Chat Filters {!profile?.is_paid && '(PRO only)'}</h3>

            {!profile?.is_paid && (
              <div className="upgrade-overlay">
                <p>
                  <Link to="/pricing">Upgrade to unlock filters</Link>
                </p>
              </div>
            )}

            <div className="filter-group">
              <label htmlFor="genderFilter">Gender</label>
              <select
                id="genderFilter"
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                disabled={!profile?.is_paid || isBanned}
              >
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="regionFilter">Region</label>
              <select
                id="regionFilter"
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                disabled={!profile?.is_paid || isBanned}
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
          </div>
        )}

      </main>

      <footer className="home-footer">
        <div className="footer-links">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/safety">Safety Center</Link>
        </div>
        <p className="footer-note">
          Olyx.site is a neutral platform that does not support war, violence, or harm against any country or group.
        </p>
      </footer>

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="modal-overlay">
          <div className="modal permission-modal">
            <h3>Camera and Microphone Required</h3>
            <p>
              Camera and microphone access are required to chat on Olyx.site.
            </p>
            <p className="modal-privacy">
              We do not record audio or video. All calls are peer-to-peer and private.
            </p>

            <div className="modal-actions">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handlePermissionGranted}
                className="btn btn-primary"
              >
                Allow & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
