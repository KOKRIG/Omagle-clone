import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useVisitorCount } from '../hooks/useVisitorCount'
import AdViewer from '../components/AdViewer'
import BannerAd from '../components/BannerAd'
import VerticalBannerAd from '../components/VerticalBannerAd'
import NativeAd from '../components/NativeAd'

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
  const visitorCount = useVisitorCount()
  const [activeUsers, setActiveUsers] = useState(0)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [showAdViewer, setShowAdViewer] = useState(false)
  const [adPremiumTimeLeft, setAdPremiumTimeLeft] = useState(null)

  const hasAdPremium = profile?.ad_premium_expires_at && new Date(profile.ad_premium_expires_at) > new Date()
  const isPro = profile?.is_paid || PRO_EMAILS.includes(profile?.email?.toLowerCase()) || hasAdPremium

  useEffect(() => {
    if (profile) {
      if (profile.ban_until && new Date(profile.ban_until) > new Date()) {
        setIsBanned(true)
        setBanExpiry(profile.ban_until)
      }

      checkBillingStatus()
      checkAdPremiumStatus()

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

  useEffect(() => {
    if (hasAdPremium) {
      const interval = setInterval(() => {
        const timeLeft = Math.floor((new Date(profile.ad_premium_expires_at) - new Date()) / 1000)
        if (timeLeft > 0) {
          const minutes = Math.floor(timeLeft / 60)
          const seconds = timeLeft % 60
          setAdPremiumTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        } else {
          setAdPremiumTimeLeft(null)
          window.location.reload()
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [hasAdPremium, profile])

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

  const checkAdPremiumStatus = async () => {
    if (profile?.ad_premium_expires_at && new Date(profile.ad_premium_expires_at) < new Date()) {
      await supabase
        .from('profiles')
        .update({ ad_premium_expires_at: null })
        .eq('id', user.id)

      setProfile({ ...profile, ad_premium_expires_at: null })
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

  const handleAdViewerClose = () => {
    setShowAdViewer(false)
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

  const handleWatchAds = () => {
    setShowAdViewer(true)
  }

  const handleAdComplete = async () => {
    setShowAdViewer(false)

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (data) {
      setProfile(data)
    }
  }

  useEffect(() => {
    const popunderScript = document.createElement('script')
    popunderScript.src = 'https://pl28564266.effectivegatecpm.com/e8/a8/8e/e8a88ef3b2c76db8a7ce2199d6df5941.js'
    document.head.appendChild(popunderScript)

    return () => {
      if (popunderScript.parentNode) {
        popunderScript.parentNode.removeChild(popunderScript)
      }
    }
  }, [])

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <Link to="/" className="dashboard-logo gradient-text">
          Olyx.site
        </Link>
        <div className="dashboard-nav">
          <div className="active-indicator">
            <span className="pulse-dot"></span>
            <span>{visitorCount > 0 ? visitorCount : activeUsers} online</span>
          </div>
          <Link to="/pricing" className="nav-link">Pricing</Link>
          <button onClick={handleLogout} className="nav-link logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Top Banner */}
      <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'center', background: 'rgba(14, 165, 233, 0.05)' }}>
        <BannerAd />
      </div>

      <main className="dashboard-main" style={{ display: 'flex', gap: '0.5rem', maxWidth: '1600px', margin: '0 auto', padding: '0.5rem' }}>
        {/* Left Side Ads */}
        <div style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NativeAd />
          <VerticalBannerAd />
          <NativeAd />
        </div>

        {/* Main Content */}
        <div style={{ flex: '1', minWidth: 0 }}>
          <BannerAd />

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
                  <span className="pro-badge">
                    {hasAdPremium ? `PRO ${adPremiumTimeLeft}` : 'PRO'}
                  </span>
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
                <>
                  <button onClick={handleWatchAds} className="watch-ads-btn">
                    Watch Ads for 4 Min Premium
                  </button>
                  <Link to="/pricing" className="upgrade-link">
                    Upgrade to PRO
                  </Link>
                </>
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
                    <button onClick={handleWatchAds} className="watch-ads-overlay-btn">
                      Watch Ads to Unlock
                    </button>
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

          {/* Bottom Banner in content */}
          <div style={{ padding: '0.5rem 0', display: 'flex', justifyContent: 'center' }}>
            <BannerAd />
          </div>
        </div>

        {/* Right Side Ads */}
        <div style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NativeAd />
          <VerticalBannerAd />
          <NativeAd />
        </div>
      </main>

      {/* Bottom Banner */}
      <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'center', background: 'rgba(14, 165, 233, 0.05)' }}>
        <BannerAd />
      </div>

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

      {showAdViewer && (
        <AdViewer onComplete={handleAdComplete} onClose={handleAdViewerClose} />
      )}
    </div>
  )
}
