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

  // Initialize media stream
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: true,
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
    } catch (err) {
      setError(err.message)
    }
  }, [initializeMedia, createPeerConnection, createOffer, isInitiator])

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
