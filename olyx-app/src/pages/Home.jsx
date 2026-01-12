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
    }
  }, [profile])

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

  const handleStartChat = async () => {
    if (isBanned) {
      return
    }

    setLoading(true)

    try {
      // Update presence to searching
      await supabase
        .from('profiles')
        .update({ presence: 'searching' })
        .eq('id', user.id)

      // Navigate to chat page
      navigate('/chat', { state: { filters } })
    } catch (err) {
      console.error('Failed to start chat:', err)
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
        <nav className="nav-links">
          <Link to="/pricing">Pricing</Link>
          <button onClick={handleLogout} className="btn btn-text">
            Logout
          </button>
        </nav>
      </header>

      <main className="home-main">
        <div className="welcome-section">
          <h2>Welcome to Olyx.site</h2>
          <p>Connect with random people through video chat</p>
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

        <div className="filters-section">
          <h3>Chat Filters {!profile?.is_paid && '(PRO only)'}</h3>

          <div className="filter-group">
            <label htmlFor="genderFilter">Preferred Gender</label>
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
            <label htmlFor="regionFilter">Preferred Region</label>
            <select
              id="regionFilter"
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              disabled={!profile?.is_paid || isBanned}
            >
              <option value="">Any Region</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="Australia">Australia</option>
            </select>
          </div>

          {!profile?.is_paid && (
            <p className="filter-notice">
              <Link to="/pricing">Upgrade to PRO</Link> to unlock filters
            </p>
          )}
        </div>

        <div className="action-section">
          <button
            onClick={handleStartChat}
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? 'Finding Match...' : 'Start Chat'}
          </button>

          {!profile?.is_paid && (
            <Link to="/pricing" className="btn btn-secondary btn-large">
              Upgrade to PRO
            </Link>
          )}
        </div>
      </main>

      <footer className="home-footer">
        <div className="footer-links">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
        <p className="footer-note">
          Olyx.site promotes peaceful communication. We do not support war,
          violence, or harm against any country or group.
        </p>
      </footer>
    </div>
  )
}
