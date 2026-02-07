import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMatchmaking } from '../hooks/useMatchmaking'
import { useWebRTC } from '../hooks/useWebRTC'
import { useNSFWDetection } from '../hooks/useNSFWDetection'
import { useAntiBotDetection } from '../hooks/useAntiBotDetection'
import { supabase } from '../lib/supabase'
import BannerAd from '../components/BannerAd'
import NativeAd from '../components/NativeAd'

const REPORT_REASONS = [
  { value: 'inappropriate', label: 'Inappropriate behavior' },
  { value: 'sexual_aggression', label: 'Sexual aggression' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'violence', label: 'Violence/Threats' },
  { value: 'spam', label: 'Spam/Bot' },
  { value: 'fake_video', label: 'Fake/Virtual camera' },
]

export default function Chat() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile } = useAuth()

  const filters = location.state?.filters || {}

  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const chatContainerRef = useRef(null)

  const {
    matchStatus,
    matchedUser,
    matchId,
    onlineCount,
    searchDuration,
    joinQueue,
    leaveQueue,
    endMatch,
  } = useMatchmaking(user?.id, profile, filters)

  const isInitiator = matchedUser && profile?.id < matchedUser.id

  const {
    localStream,
    remoteStream,
    connectionState,
    dataChannel,
    toggleAudio,
    toggleVideo,
    closeConnection,
    destroyPeerConnection,
  } = useWebRTC(matchId, user?.id, isInitiator)

  const handleViolation = useCallback(
    async (type) => {
      if (type === 'nsfw_content' || type === 'bot_detected') {
        await handleDisconnect()
        if (matchedUser) {
          await submitReport(type === 'nsfw_content' ? 'inappropriate' : 'spam')
        }
      }
    },
    [matchedUser]
  )

  const { startMonitoring, stopMonitoring } = useNSFWDetection(
    remoteVideoRef.current,
    handleViolation
  )

  useAntiBotDetection(handleViolation)

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream
      startMonitoring()
    }
  }, [remoteStream, startMonitoring])

  useEffect(() => {
    if (user && profile && matchStatus === 'idle') {
      joinQueue()
    }

    return () => {
      leaveQueue()
      closeConnection()
      stopMonitoring()
    }
  }, [user, profile])

  const handleDisconnect = async () => {
    stopMonitoring()
    destroyPeerConnection()
    await endMatch()
    setChatMessages([])

    if (user) {
      await supabase
        .from('profiles')
        .update({ presence: 'online' })
        .eq('id', user.id)
    }
  }

  const handleNext = async () => {
    await handleDisconnect()
    joinQueue()
  }

  const handleExit = async () => {
    await handleDisconnect()
    closeConnection()
    navigate('/home')
  }

  const handleToggleAudio = () => {
    const enabled = toggleAudio()
    setIsAudioEnabled(enabled)
  }

  const handleToggleVideo = () => {
    const enabled = toggleVideo()
    setIsVideoEnabled(enabled)
  }

  useEffect(() => {
    if (!dataChannel) return

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'chat') {
          setChatMessages((prev) => [
            ...prev,
            { id: Date.now(), text: data.text, sender: 'them' },
          ])
        }
      } catch (err) {
        console.error('Failed to parse message:', err)
      }
    }

    dataChannel.addEventListener('message', handleMessage)
    return () => {
      dataChannel.removeEventListener('message', handleMessage)
    }
  }, [dataChannel])

  const sendChatMessage = () => {
    if (!chatMessage.trim() || !dataChannel) return

    const message = {
      type: 'chat',
      text: chatMessage.trim(),
      timestamp: Date.now(),
    }

    if (dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify(message))
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now(), text: chatMessage.trim(), sender: 'me' },
      ])
      setChatMessage('')
    }
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  const submitReport = async (reason) => {
    if (!matchedUser || !user) return
    setReportSubmitting(true)

    try {
      await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_id: matchedUser.id,
        reason: reason || reportReason,
      })
      await supabase.rpc('increment_report_count', {
        reported_user_id: matchedUser.id,
      })
      setShowReportModal(false)
      setReportReason('')
      await handleDisconnect()
    } catch (err) {
      console.error('Report failed:', err)
    } finally {
      setReportSubmitting(false)
    }
  }

  const hasAdPremium = profile?.ad_premium_expires_at && new Date(profile.ad_premium_expires_at) > new Date()
  const isPaid = profile?.is_paid || hasAdPremium
  const shouldShowAds = !isPaid

  const formatSearchTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`
  }

  return (
    <div className="chat-page">
      <div className="chat-layout">
        {shouldShowAds && (
          <div className="chat-ad-sidebar chat-ad-left">
            <NativeAd />
          </div>
        )}

        <div className="chat-center">
          <div className="chat-safety-bar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            <span>End-to-end private. No recordings.</span>
          </div>

          {shouldShowAds && (
            <div className="chat-ad-top">
              <BannerAd />
            </div>
          )}

          <div className="chat-video-area">
            <div className="video-grid">
              <div className="video-wrapper remote-video">
                {matchStatus === 'searching' && (
                  <div className="search-screen">
                    <div className="search-radar">
                      <div className="radar-ring radar-ring-1"></div>
                      <div className="radar-ring radar-ring-2"></div>
                      <div className="radar-ring radar-ring-3"></div>
                      <div className="radar-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </div>
                    </div>

                    <h3 className="search-title">
                      {searchDuration < 15 ? 'Looking for someone...' : 'Still searching...'}
                    </h3>
                    <p className="search-subtitle">
                      {searchDuration < 15
                        ? 'Connecting you with a random person'
                        : 'Hang tight, waiting for more people'}
                    </p>

                    <div className="search-stats">
                      <div className="search-stat">
                        <span className="stat-dot-live"></span>
                        <span>{onlineCount} in queue</span>
                      </div>
                      <div className="search-stat">
                        <span className="stat-time">{formatSearchTime(searchDuration)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {matchStatus === 'found' && (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="video-element"
                  />
                )}

                {matchStatus === 'found' && connectionState !== 'connected' && (
                  <div className="connection-overlay">
                    <div className="connecting-spinner"></div>
                    <p>Establishing connection...</p>
                  </div>
                )}
              </div>

              <div className="video-wrapper local-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="video-element"
                />
                {!isVideoEnabled && (
                  <div className="video-off-overlay">
                    <span>Camera Off</span>
                  </div>
                )}
              </div>
            </div>

            <div className="video-controls">
              <button
                onClick={handleToggleAudio}
                className={`control-btn ${!isAudioEnabled ? 'control-off' : ''}`}
                title={isAudioEnabled ? 'Mute' : 'Unmute'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isAudioEnabled ? (
                    <>
                      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                      <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </>
                  ) : (
                    <>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                      <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/>
                      <path d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .87-.16 1.71-.46 2.49"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </>
                  )}
                </svg>
              </button>

              <button
                onClick={handleToggleVideo}
                className={`control-btn ${!isVideoEnabled ? 'control-off' : ''}`}
                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isVideoEnabled ? (
                    <>
                      <polygon points="23 7 16 12 23 17 23 7"/>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </>
                  ) : (
                    <>
                      <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34l1 1L23 7v10"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  )}
                </svg>
              </button>

              <button onClick={handleNext} className="control-btn control-next" title="Next person">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 4 15 12 5 20 5 4"/>
                  <line x1="19" y1="5" x2="19" y2="19"/>
                </svg>
                <span>Next</span>
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="control-btn control-report"
                title="Report user"
                disabled={matchStatus !== 'found'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                  <line x1="4" y1="22" x2="4" y2="15"/>
                </svg>
              </button>

              <button onClick={handleExit} className="control-btn control-exit" title="Exit chat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>Exit</span>
              </button>
            </div>
          </div>

          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <h3>Chat</h3>
              {matchedUser && (
                <span className="matched-badge">
                  <span className="matched-dot"></span>
                  {matchedUser.country || 'Unknown'}
                </span>
              )}
            </div>

            <div className="chat-messages" ref={chatContainerRef}>
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.sender === 'me' ? 'sent' : 'received'}`}
                >
                  <span className="message-text">{msg.text}</span>
                </div>
              ))}

              {chatMessages.length === 0 && matchStatus === 'found' && (
                <p className="no-messages">Say hello!</p>
              )}

              {matchStatus === 'searching' && (
                <p className="no-messages">Waiting for a match...</p>
              )}
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder={matchStatus === 'found' ? 'Type a message...' : 'Waiting for match...'}
                disabled={matchStatus !== 'found'}
                className="chat-input"
                maxLength={500}
              />
              <button
                onClick={sendChatMessage}
                disabled={matchStatus !== 'found' || !chatMessage.trim()}
                className="send-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {shouldShowAds && (
          <div className="chat-ad-sidebar chat-ad-right">
            <NativeAd />
          </div>
        )}
      </div>

      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Report User</h3>
            <p>Please select a reason for reporting:</p>

            <div className="report-options">
              {REPORT_REASONS.map((reason) => (
                <label key={reason.value} className="report-option">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.value}
                    checked={reportReason === reason.value}
                    onChange={(e) => setReportReason(e.target.value)}
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowReportModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => submitReport()}
                className="btn btn-danger"
                disabled={!reportReason || reportSubmitting}
              >
                {reportSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
