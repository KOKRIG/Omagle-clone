import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import AdViewer from '../components/AdViewer'
import BannerAd from '../components/BannerAd'
import VerticalBannerAd from '../components/VerticalBannerAd'

export default function Pricing() {
  const navigate = useNavigate()
  const { user, profile, setProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showAdViewer, setShowAdViewer] = useState(false)

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)

    try {
      const today = new Date()
      const nextBilling = new Date(today)
      nextBilling.setDate(nextBilling.getDate() + 30)

      const { error } = await supabase
        .from('profiles')
        .update({
          is_paid: true,
          billing_start: today.toISOString().split('T')[0],
          next_billing: nextBilling.toISOString().split('T')[0],
          plan: 'pro',
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile({
        ...profile,
        is_paid: true,
        billing_start: today.toISOString().split('T')[0],
        next_billing: nextBilling.toISOString().split('T')[0],
        plan: 'pro',
      })

      setSuccess(true)
    } catch (err) {
      console.error('Upgrade failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleWatchAds = () => {
    if (!user) {
      navigate('/login')
      return
    }
    setShowAdViewer(true)
  }

  const handleAdComplete = async () => {
    setShowAdViewer(false)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      navigate('/home')
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

  if (success) {
    return (
      <div style={{ display: 'flex', gap: '1rem', maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
        <div style={{ flex: '0 0 160px', display: 'flex', justifyContent: 'center' }}>
          <VerticalBannerAd />
        </div>

        <div className="pricing-container" style={{ flex: '1', minWidth: 0 }}>
          <BannerAd />
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h2>Welcome to PRO!</h2>
            <p>Your account has been upgraded successfully.</p>
            <ul className="success-features">
              <li>Gender filter unlocked</li>
              <li>Region filter unlocked</li>
              <li>Priority matchmaking enabled</li>
              <li>Ad-free experience</li>
            </ul>
            <Link to="/home" className="btn btn-primary">
              Start Chatting
            </Link>
          </div>
        </div>

        <div style={{ flex: '0 0 160px', display: 'flex', justifyContent: 'center' }}>
          <VerticalBannerAd />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '1rem', maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ flex: '0 0 160px', display: 'flex', justifyContent: 'center' }}>
        <VerticalBannerAd />
      </div>

      <div className="pricing-container" style={{ flex: '1', minWidth: 0 }}>
      <header className="pricing-header">
        <Link to="/home" className="back-link">
          ← Back to Home
        </Link>
        <h1>Choose Your Plan</h1>
        <p>Unlock premium features for a better experience</p>
      </header>

      <BannerAd />

      <div className="plans-grid-extended">
        <div className="plan-card">
          <div className="plan-header">
            <h2>Free</h2>
            <div className="plan-price">
              <span className="price">$0</span>
              <span className="period">/month</span>
            </div>
          </div>
          <ul className="plan-features">
            <li className="feature-included">Random video chat</li>
            <li className="feature-included">Text chat</li>
            <li className="feature-included">Basic matching</li>
            <li className="feature-excluded">Gender filter</li>
            <li className="feature-excluded">Region filter</li>
            <li className="feature-excluded">Priority matchmaking</li>
            <li className="feature-excluded">Ad-free experience</li>
          </ul>
          <button className="btn btn-secondary" disabled>
            Current Plan
          </button>
        </div>

        <div className="plan-card plan-special">
          <div className="plan-badge">FREE OPTION</div>
          <div className="plan-header">
            <h2>Watch Ads</h2>
            <div className="plan-price">
              <span className="price">4 Min</span>
              <span className="period">Premium</span>
            </div>
          </div>
          <ul className="plan-features">
            <li className="feature-included">Watch 4 short ads</li>
            <li className="feature-included">Get 4 minutes premium</li>
            <li className="feature-included">Gender filter</li>
            <li className="feature-included">Region filter</li>
            <li className="feature-included">Priority matchmaking</li>
            <li className="feature-info">Must wait 5s per ad</li>
            <li className="feature-info">Repeatable anytime</li>
          </ul>
          <button
            className="btn btn-primary"
            onClick={handleWatchAds}
          >
            Watch 4 Ads Now
          </button>
        </div>
        </div>

        <div className="pricing-faq">
        <h3>Frequently Asked Questions</h3>

        <div className="faq-item">
          <h4>How does the Watch Ads option work?</h4>
          <p>
            Watch 4 ads (5 seconds each) to unlock all premium features for 4 minutes.
            You can repeat this anytime your premium expires. Perfect for trying premium features!
          </p>
        </div>

        <div className="faq-item">
          <h4>How does billing work?</h4>
          <p>
            Your subscription renews monthly. You can cancel anytime and your
            PRO features will remain active until the end of your billing period.
          </p>
        </div>

        <div className="faq-item">
          <h4>What payment methods do you accept?</h4>
          <p>
            We accept all major credit cards through our secure payment processor
            Stripe.
          </p>
        </div>

        <div className="faq-item">
          <h4>Can I get a refund?</h4>
          <p>
            Yes, we offer a 7-day money-back guarantee if you're not satisfied
            with PRO.
          </p>
        </div>

        <div className="faq-item">
          <h4>What's priority matchmaking?</h4>
          <p>
            PRO users are matched faster and have higher success rates finding
            compatible chat partners.
          </p>
        </div>
      </div>

        <footer className="pricing-footer">
          <p>
            Questions? <Link to="/contact">Contact us</Link>
          </p>
        </footer>

        {showAdViewer && (
          <AdViewer onComplete={handleAdComplete} onClose={() => setShowAdViewer(false)} />
        )}
      </div>

      <div style={{ flex: '0 0 160px', display: 'flex', justifyContent: 'center' }}>
        <VerticalBannerAd />
      </div>
    </div>
  )
}
