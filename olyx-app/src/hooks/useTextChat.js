import { useState, useCallback, useRef, useEffect } from 'react'

// Banned words and patterns for text moderation
const BANNED_PATTERNS = [
  /\b(kill|murder|die|death threat)\b/i,
  /\b(rape|sexual assault)\b/i,
  /\b(terrorist|terrorism)\b/i,
  /\b(racial slurs)\b/i, // In production, add actual slurs
]

const SPAM_THRESHOLD = 5 // Messages per 10 seconds
const SPAM_WINDOW = 10000 // 10 seconds

export function useTextChat(dataChannel, onViolation) {
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const messageTimestamps = useRef([])
  const violationCount = useRef(0)

  // Check for spam
  const checkSpam = useCallback(() => {
    const now = Date.now()
    messageTimestamps.current = messageTimestamps.current.filter(
      (ts) => now - ts < SPAM_WINDOW
    )

    if (messageTimestamps.current.length >= SPAM_THRESHOLD) {
      return true
    }

    messageTimestamps.current.push(now)
    return false
  }, [])

  // Check for banned content
  const checkBannedContent = useCallback((text) => {
    for (const pattern of BANNED_PATTERNS) {
      if (pattern.test(text)) {
        return { isBanned: true, pattern: pattern.toString() }
      }
    }
    return { isBanned: false, pattern: null }
  }, [])

  // Moderate message
  const moderateMessage = useCallback(
    (text) => {
      // Check for spam
      if (checkSpam()) {
        setIsMuted(true)
        setTimeout(() => setIsMuted(false), 30000) // Mute for 30 seconds
        onViolation?.('spam', 'Message rate limit exceeded')
        return { allowed: false, reason: 'spam' }
      }

      // Check for banned content
      const { isBanned } = checkBannedContent(text)
      if (isBanned) {
        violationCount.current++

        if (violationCount.current >= 3) {
          onViolation?.('harassment', 'Multiple text violations detected')
        }

        return { allowed: false, reason: 'banned_content' }
      }

      return { allowed: true, reason: null }
    },
    [checkSpam, checkBannedContent, onViolation]
  )

  // Send message
  const sendMessage = useCallback(
    (text) => {
      if (!dataChannel || dataChannel.readyState !== 'open') {
        return { success: false, error: 'Not connected' }
      }

      if (isMuted) {
        return { success: false, error: 'You are temporarily muted' }
      }

      const trimmedText = text.trim()
      if (!trimmedText) {
        return { success: false, error: 'Empty message' }
      }

      if (trimmedText.length > 500) {
        return { success: false, error: 'Message too long (max 500 characters)' }
      }

      // Moderate the message
      const moderation = moderateMessage(trimmedText)
      if (!moderation.allowed) {
        return { success: false, error: `Message blocked: ${moderation.reason}` }
      }

      // Send via data channel
      const message = {
        type: 'chat',
        text: trimmedText,
        timestamp: Date.now(),
      }

      try {
        dataChannel.send(JSON.stringify(message))

        // Add to local messages
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: trimmedText,
            sender: 'me',
            timestamp: Date.now(),
          },
        ])

        return { success: true }
      } catch (err) {
        return { success: false, error: 'Failed to send message' }
      }
    },
    [dataChannel, isMuted, moderateMessage]
  )

  // Handle incoming message
  const handleIncomingMessage = useCallback((messageData) => {
    try {
      const data = JSON.parse(messageData)

      if (data.type === 'chat') {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: data.text,
            sender: 'them',
            timestamp: data.timestamp,
          },
        ])
      }
    } catch (err) {
      console.error('Failed to parse message:', err)
    }
  }, [])

  // Set up data channel listeners
  useEffect(() => {
    if (!dataChannel) return

    const handleOpen = () => setIsConnected(true)
    const handleClose = () => setIsConnected(false)
    const handleMessage = (event) => handleIncomingMessage(event.data)

    dataChannel.addEventListener('open', handleOpen)
    dataChannel.addEventListener('close', handleClose)
    dataChannel.addEventListener('message', handleMessage)

    // Check initial state
    if (dataChannel.readyState === 'open') {
      setIsConnected(true)
    }

    return () => {
      dataChannel.removeEventListener('open', handleOpen)
      dataChannel.removeEventListener('close', handleClose)
      dataChannel.removeEventListener('message', handleMessage)
    }
  }, [dataChannel, handleIncomingMessage])

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([])
    violationCount.current = 0
    messageTimestamps.current = []
  }, [])

  return {
    messages,
    isConnected,
    isMuted,
    sendMessage,
    clearMessages,
  }
}
