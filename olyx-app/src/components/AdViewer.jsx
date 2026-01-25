import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AdViewer({ onComplete, onClose }) {
  const [currentAd, setCurrentAd] = useState(1)
  const [timeRemaining, setTimeRemaining] = useState(5)
  const [isAdLoaded, setIsAdLoaded] = useState(false)

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (currentAd < 4) {
      setCurrentAd(currentAd + 1)
      setTimeRemaining(5)
      setIsAdLoaded(false)
    } else {
      handleComplete()
    }
  }, [timeRemaining, currentAd])

  useEffect(() => {
    const timer = setTimeout(() => setIsAdLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [currentAd])

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
            {timeRemaining > 0 ? `Wait ${timeRemaining}s` : 'Loading next...'}
          </div>
        </div>

        <div className="ad-content-wrapper">
          {isAdLoaded ? (
            <div className="ad-content">
              <div className="native-ad-container">
                <script
                  async
                  data-cfasync="false"
                  src="https://pl28502753.effectivegatecpm.com/99507b6482f10827a9ff00a49258c20e/invoke.js"
                />
                <div id="container-99507b6482f10827a9ff00a49258c20e"></div>
              </div>
              <div className="ad-placeholder">
                <div className="ad-icon">📺</div>
                <p>Advertisement {currentAd}</p>
                <p className="ad-subtitle">Unlocking premium features...</p>
              </div>
            </div>
          ) : (
            <div className="ad-loading">Loading advertisement...</div>
          )}
        </div>

        <div className="ad-viewer-footer">
          <p className="ad-info">
            Watch {4 - currentAd} more {4 - currentAd === 1 ? 'ad' : 'ads'} to unlock 4 minutes of premium
          </p>
          {timeRemaining === 0 && currentAd === 4 && (
            <button onClick={handleComplete} className="ad-continue-btn">
              Continue to Premium
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
