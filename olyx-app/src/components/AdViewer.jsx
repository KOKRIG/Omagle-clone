import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AdViewer({ onComplete, onClose }) {
  const [currentAd, setCurrentAd] = useState(1)
  const [timeRemaining, setTimeRemaining] = useState(5)
  const [showAdBlockerWarning, setShowAdBlockerWarning] = useState(false)

  useEffect(() => {
    openPopupAd()
  }, [currentAd])

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [timeRemaining])

  const openPopupAd = () => {
    try {
      const popup = window.open(
        'https://olyx.site',
        `popup_ad_${currentAd}`,
        'width=800,height=600,scrollbars=yes,resizable=yes'
      )

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        setShowAdBlockerWarning(true)
      }
    } catch (e) {
      setShowAdBlockerWarning(true)
    }
  }

  const handleNextAd = () => {
    if (timeRemaining > 0) return

    if (currentAd < 4) {
      setCurrentAd(currentAd + 1)
      setTimeRemaining(5)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    const expiresAt = new Date(Date.now() + 4 * 60 * 1000).toISOString()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('profiles')
        .update({ ad_premium_expires_at: expiresAt })
        .eq('id', user.id)
    }

    onComplete()
  }

  return (
    <div className="ad-viewer-overlay">
      <div className="ad-viewer-modal">
        <div className="ad-viewer-header">
          <div className="ad-progress">
            <span className="ad-counter">Ad {currentAd} of 4</span>
            <div className="progress-dots">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={`progress-dot ${num <= currentAd ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
          <div className="ad-timer">
            {timeRemaining > 0 ? `Wait ${timeRemaining}s` : 'Ready'}
          </div>
        </div>

        <div className="ad-content-wrapper">
          {showAdBlockerWarning ? (
            <div className="ad-blocker-warning">
              <div className="warning-icon">⚠️</div>
              <h3>Ad Blocker Detected</h3>
              <p>Please disable your ad blocker to continue.</p>
              <p className="warning-subtitle">
                This feature is supported by ads. Disabling your ad blocker allows us to provide free premium access.
              </p>
              <button onClick={onClose} className="warning-btn">
                Go Back
              </button>
            </div>
          ) : (
            <div className="ad-content">
              <div className="ad-icon">📺</div>
              <h3>Advertisement {currentAd}</h3>
              <p className="ad-subtitle">
                A popup window has opened. Please wait {timeRemaining > 0 ? `${timeRemaining} seconds` : 'and close it'} before continuing.
              </p>
              <div className="ad-info-box">
                <p>✓ Popup ad opened automatically</p>
                <p>✓ Wait for the timer to complete</p>
                <p>✓ Then click "Next Ad" to continue</p>
              </div>
            </div>
          )}
        </div>

        <div className="ad-viewer-footer">
          <p className="ad-info">
            {currentAd < 4
              ? `${4 - currentAd} more ${4 - currentAd === 1 ? 'ad' : 'ads'} to unlock 4 minutes of premium`
              : 'All ads completed! Claim your premium access.'
            }
          </p>
          <div className="ad-buttons">
            <button onClick={onClose} className="ad-cancel-btn">
              Cancel
            </button>
            <button
              onClick={handleNextAd}
              className="ad-continue-btn"
              disabled={timeRemaining > 0}
            >
              {currentAd < 4 ? 'Next Ad' : 'Claim Premium'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
