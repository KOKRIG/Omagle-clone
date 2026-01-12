import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// Stripe test mode configuration
// In production, this would be your live publishable key
const STRIPE_CHECKOUT_URL = 'https://checkout.stripe.com/c/pay/'

export default function Pricing() {
  const navigate = useNavigate()
  const { user, profile, setProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)

    try {
      // For MVP: Simulate Stripe checkout success
      // In production, you would:
      // 1. Create a Stripe Checkout session via Edge Function
      // 2. Redirect to Stripe Checkout
      // 3. Handle webhook on success to update database

      // Simulated success flow for demo
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

  if (success) {
    return (
      <div className="pricing-container">
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
    )
  }

  return (
    <div className="pricing-container">
      <header className="pricing-header">
        <Link to="/home" className="back-link">
          ← Back to Home
        </Link>
        <h1>Choose Your Plan</h1>
        <p>Unlock premium features for a better experience</p>
      </header>

      <div className="plans-grid">
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
            <li className="feature-included">Same-gender matching</li>
            <li className="feature-excluded">Gender filter</li>
            <li className="feature-excluded">Region filter</li>
            <li className="feature-excluded">Priority matchmaking</li>
            <li className="feature-excluded">Ad-free experience</li>
          </ul>
          {profile?.is_paid ? (
            <button className="btn btn-secondary" disabled>
              Current Plan
            </button>
          ) : (
            <button className="btn btn-secondary" disabled>
              Current Plan
            </button>
          )}
        </div>

        <div className="plan-card plan-featured">
          <div className="plan-badge">MOST POPULAR</div>
          <div className="plan-header">
            <h2>PRO</h2>
            <div className="plan-price">
              <span className="price">$9</span>
              <span className="period">/month</span>
            </div>
          </div>
          <ul className="plan-features">
            <li className="feature-included">Random video chat</li>
            <li className="feature-included">Text chat</li>
            <li className="feature-included">Same-gender matching</li>
            <li className="feature-included">Gender filter</li>
            <li className="feature-included">Region filter</li>
            <li className="feature-included">Priority matchmaking</li>
            <li className="feature-included">Ad-free experience</li>
          </ul>
          {profile?.is_paid ? (
            <button className="btn btn-primary" disabled>
              Current Plan
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Upgrade to PRO'}
            </button>
          )}
        </div>
      </div>

      <div className="pricing-faq">
        <h3>Frequently Asked Questions</h3>

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
    </div>
  )
}
