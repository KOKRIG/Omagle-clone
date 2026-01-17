import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
]

export function useWebRTC(matchId, userId, isInitiator) {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [connectionState, setConnectionState] = useState('new')
  const [error, setError] = useState(null)

  const peerConnection = useRef(null)
  const dataChannel = useRef(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const iceCandidatesQueue = useRef([])
  const qualityMonitorInterval = useRef(null)

  // Initialize media stream with quality constraints
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { min: 480, ideal: 1280, max: 1920 },
          height: { min: 360, ideal: 720, max: 1080 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      setLocalStream(stream)
      return stream
    } catch (err) {
      setError('Camera/microphone access denied')
      throw err
    }
  }, [])

  // Create peer connection
  const createPeerConnection = useCallback(
    (stream) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

      // Add local tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream)
      })

      // Create data channel (for initiator)
      if (isInitiator) {
        const dc = pc.createDataChannel('chat')
        dataChannel.current = dc
      } else {
        // Handle incoming data channel (for receiver)
        pc.ondatachannel = (event) => {
          dataChannel.current = event.channel
        }
      }

      // Handle remote tracks
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams
        setRemoteStream(remoteStream)
      }

      // Handle ICE candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate && matchId) {
          await supabase.from('ice_candidates').insert({
            match_id: matchId,
            sender_id: userId,
            candidate: event.candidate.toJSON(),
          })
        }
      }

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        setConnectionState(pc.connectionState)
      }

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed') {
          pc.restartIce()
        }
      }

      peerConnection.current = pc
      return pc
    },
    [matchId, userId, isInitiator]
  )

  // Create and send offer (for initiator)
  const createOffer = useCallback(async () => {
    if (!peerConnection.current || !matchId) return

    try {
      const offer = await peerConnection.current.createOffer()
      await peerConnection.current.setLocalDescription(offer)

      await supabase
        .from('active_matches')
        .update({ offer: JSON.stringify(offer) })
        .eq('id', matchId)
    } catch (err) {
      setError('Failed to create offer')
    }
  }, [matchId])

  // Handle incoming offer and create answer
  const handleOffer = useCallback(
    async (offer) => {
      if (!peerConnection.current || !matchId) return

      try {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(offer)
        )

        const answer = await peerConnection.current.createAnswer()
        await peerConnection.current.setLocalDescription(answer)

        await supabase
          .from('active_matches')
          .update({ answer: JSON.stringify(answer) })
          .eq('id', matchId)

        // Process queued ICE candidates
        for (const candidate of iceCandidatesQueue.current) {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          )
        }
        iceCandidatesQueue.current = []
      } catch (err) {
        setError('Failed to handle offer')
      }
    },
    [matchId]
  )

  // Handle incoming answer
  const handleAnswer = useCallback(async (answer) => {
    if (!peerConnection.current) return

    try {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      )

      // Process queued ICE candidates
      for (const candidate of iceCandidatesQueue.current) {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        )
      }
      iceCandidatesQueue.current = []
    } catch (err) {
      setError('Failed to handle answer')
    }
  }, [])

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (candidate) => {
    if (!peerConnection.current) return

    try {
      if (peerConnection.current.remoteDescription) {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        )
      } else {
        iceCandidatesQueue.current.push(candidate)
      }
    } catch (err) {
      console.error('Failed to add ICE candidate:', err)
    }
  }, [])

  // Start connection
  const startConnection = useCallback(async () => {
    try {
      const stream = await initializeMedia()
      createPeerConnection(stream)

      if (isInitiator) {
        await createOffer()
      }

      // Start quality monitoring
      monitorConnectionQuality()
    } catch (err) {
      setError(err.message)
    }
  }, [initializeMedia, createPeerConnection, createOffer, isInitiator, monitorConnectionQuality])

  // Close connection
  const closeConnection = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
    }

    if (dataChannel.current) {
      dataChannel.current.close()
      dataChannel.current = null
    }

    if (peerConnection.current) {
      peerConnection.current.close()
      peerConnection.current = null
    }

    if (qualityMonitorInterval.current) {
      clearInterval(qualityMonitorInterval.current)
      qualityMonitorInterval.current = null
    }

    setRemoteStream(null)
    setConnectionState('closed')
  }, [localStream])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        return audioTrack.enabled
      }
    }
    return false
  }, [localStream])

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        return videoTrack.enabled
      }
    }
    return false
  }, [localStream])

  // Monitor connection quality and adjust bitrate
  const monitorConnectionQuality = useCallback(() => {
    if (!peerConnection.current) return

    const pc = peerConnection.current

    qualityMonitorInterval.current = setInterval(async () => {
      try {
        const stats = await pc.getStats()
        let bytesReceived = 0
        let packetsLost = 0
        let packetsReceived = 0

        stats.forEach((report) => {
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            bytesReceived = report.bytesReceived || 0
            packetsLost = report.packetsLost || 0
            packetsReceived = report.packetsReceived || 0
          }
        })

        // Calculate packet loss percentage
        const totalPackets = packetsLost + packetsReceived
        const lossPercentage = totalPackets > 0 ? (packetsLost / totalPackets) * 100 : 0

        // Adjust bitrate based on packet loss
        const senders = pc.getSenders()
        const videoSender = senders.find((s) => s.track?.kind === 'video')

        if (videoSender) {
          const parameters = videoSender.getParameters()
          if (!parameters.encodings) {
            parameters.encodings = [{}]
          }

          // Adjust bitrate: high loss = lower bitrate, low loss = higher bitrate
          if (lossPercentage > 5) {
            // High packet loss - reduce to 480p equivalent
            parameters.encodings[0].maxBitrate = 500000 // 500 kbps
          } else if (lossPercentage > 2) {
            // Moderate packet loss - 720p equivalent
            parameters.encodings[0].maxBitrate = 1200000 // 1.2 Mbps
          } else {
            // Good connection - allow up to 1080p equivalent
            parameters.encodings[0].maxBitrate = 2500000 // 2.5 Mbps
          }

          await videoSender.setParameters(parameters)
        }
      } catch (err) {
        console.error('Quality monitoring error:', err)
      }
    }, 5000) // Check every 5 seconds
  }, [])

  // Listen for signaling data
  useEffect(() => {
    if (!matchId || !userId) return

    // Listen for offer/answer updates
    const matchSubscription = supabase
      .channel(`match_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'active_matches',
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          const { offer, answer } = payload.new

          if (offer && !isInitiator) {
            handleOffer(JSON.parse(offer))
          }

          if (answer && isInitiator) {
            handleAnswer(JSON.parse(answer))
          }
        }
      )
      .subscribe()

    // Listen for ICE candidates
    const iceSubscription = supabase
      .channel(`ice_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ice_candidates',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          if (payload.new.sender_id !== userId) {
            handleIceCandidate(payload.new.candidate)
          }
        }
      )
      .subscribe()

    return () => {
      matchSubscription.unsubscribe()
      iceSubscription.unsubscribe()
    }
  }, [matchId, userId, isInitiator, handleOffer, handleAnswer, handleIceCandidate])

  // Auto-start connection when match is established
  useEffect(() => {
    if (matchId && userId) {
      startConnection()
    }

    return () => {
      closeConnection()
    }
  }, [matchId, userId])

  return {
    localStream,
    remoteStream,
    connectionState,
    error,
    dataChannel: dataChannel.current,
    localVideoRef,
    remoteVideoRef,
    toggleAudio,
    toggleVideo,
    closeConnection,
  }
}
