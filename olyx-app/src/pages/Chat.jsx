import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMatchmaking } from '../hooks/useMatchmaking'
import { useWebRTC } from '../hooks/useWebRTC'
import { useNSFWDetection } from '../hooks/useNSFWDetection'
import { supabase } from '../lib/supabase'

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

  // Matchmaking
  const {
    matchStatus,
    matchedUser,
    matchId,
    joinQueue,
    leaveQueue,
    endMatch,
  } = useMatchmaking(user?.id, profile, filters)

  // Determine if we're the initiator (user1)
  const isInitiator = matchedUser && profile?.id < matchedUser.id

  // WebRTC
  const {
    localStream,
    remoteStream,
    connectionState,
    dataChannel,
    toggleAudio,
    toggleVideo,
    closeConnection,
  } = useWebRTC(matchId, user?.id, isInitiator)

  // NSFW Detection
  const handleViolation = useCallback(
    async (type, message, details) => {
      console.warn('Violation detected:', type, message, details)

      if (type === 'nsfw_content') {
        // End chat immediately for NSFW
        await handleDisconnect()

        // Auto-report
        if (matchedUser) {
          await submitReport('inappropriate')
        }
      }
    },
    [matchedUser]
  )

  const { startMonitoring, stopMonitoring } = useNSFWDetection(
    remoteVideoRef.current,
    handleViolation
  )

  // Assign streams to video elements
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

  // Start searching on mount
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

  // Handle disconnection
  const handleDisconnect = async () => {
    stopMonitoring()
    closeConnection()
    await endMatch()
    setChatMessages([])

    // Update presence
    if (user) {
      await supabase
        .from('profiles')
        .update({ presence: 'online' })
        .eq('id', user.id)
    }
  }

  // Handle next match
  const handleNext = async () => {
    await handleDisconnect()
    joinQueue()
  }

  // Handle exit
  const handleExit = async () => {
    await handleDisconnect()
    navigate('/home')
  }

  // Toggle controls
  const handleToggleAudio = () => {
    const enabled = toggleAudio()
    setIsAudioEnabled(enabled)
  }

  const handleToggleVideo = () => {
    const enabled = toggleVideo()
    setIsVideoEnabled(enabled)
  }

  // Set up data channel message listener
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

  // Text chat (using WebRTC data channel)
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

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  // Report functionality
  const submitReport = async (reason) => {
    if (!matchedUser || !user) return

    setReportSubmitting(true)

    try {
      // Insert report
      await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_id: matchedUser.id,
        reason: reason || reportReason,
      })

      // Increment report count (via function)
      await supabase.rpc('increment_report_count', {
        reported_user_id: matchedUser.id,
      })

      setShowReportModal(false)
      setReportReason('')

      // End the chat
      await handleDisconnect()
    } catch (err) {
      console.error('Report failed:', err)
    } finally {
      setReportSubmitting(false)
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-main">
        <div className="video-grid">
          <div className="video-wrapper remote-video">
            {matchStatus === 'searching' && (
              <div className="video-placeholder">
                <div className="loading-spinner"></div>
                <p>Finding a match...</p>
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
                <p>Connecting...</p>
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
            className={`control-btn ${!isAudioEnabled ? 'disabled' : ''}`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? '🎤' : '🔇'}
          </button>

          <button
            onClick={handleToggleVideo}
            className={`control-btn ${!isVideoEnabled ? 'disabled' : ''}`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? '📹' : '📷'}
          </button>

          <button
            onClick={handleNext}
            className="control-btn next-btn"
            title="Next person"
          >
            ⏭️ Next
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="control-btn report-btn"
            title="Report user"
            disabled={matchStatus !== 'found'}
          >
            ⚠️ Report
          </button>

          <button
            onClick={handleExit}
            className="control-btn exit-btn"
            title="Exit chat"
          >
            🚪 Exit
          </button>
        </div>
      </div>

      <div className="chat-sidebar">
        <div className="chat-header">
          <h3>Text Chat</h3>
          {matchedUser && (
            <span className="matched-info">
              Chatting with someone from {matchedUser.country}
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
            <p className="no-messages">Start the conversation!</p>
          )}
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
            placeholder={
              matchStatus === 'found'
                ? 'Type a message...'
                : 'Waiting for match...'
            }
            disabled={matchStatus !== 'found'}
            className="chat-input"
            maxLength={500}
          />
          <button
            onClick={sendChatMessage}
            disabled={matchStatus !== 'found' || !chatMessage.trim()}
            className="send-btn"
          >
            Send
          </button>
        </div>
      </div>

      {/* Report Modal */}
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
