import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
]

const CONNECTION_TIMEOUT = 20000

export function useWebRTC(matchId, userId, isInitiator) {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [connectionState, setConnectionState] = useState('new')
  const [dataChannel, setDataChannel] = useState(null)

  const pcRef = useRef(null)
  const localStreamRef = useRef(null)
  const candidateQueue = useRef([])

  const getLocalStream = useCallback(async () => {
    if (localStreamRef.current && localStreamRef.current.active) {
      return localStreamRef.current
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    })

    localStreamRef.current = stream
    setLocalStream(stream)
    return stream
  }, [])

  const destroyPeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.ontrack = null
      pcRef.current.onicecandidate = null
      pcRef.current.onconnectionstatechange = null
      pcRef.current.oniceconnectionstatechange = null
      pcRef.current.ondatachannel = null
      pcRef.current.close()
      pcRef.current = null
    }
    setDataChannel(null)
    setRemoteStream(null)
    setConnectionState('new')
    candidateQueue.current = []
  }, [])

  const closeConnection = useCallback(() => {
    destroyPeerConnection()
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
      setLocalStream(null)
    }
  }, [destroyPeerConnection])

  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return false
    const track = localStreamRef.current.getAudioTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      return track.enabled
    }
    return false
  }, [])

  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return false
    const track = localStreamRef.current.getVideoTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      return track.enabled
    }
    return false
  }, [])

  useEffect(() => {
    if (!matchId || !userId) return

    let cancelled = false
    let matchChannel = null
    let iceChannel = null
    let timeoutId = null

    const processCandidateQueue = async (pc) => {
      while (candidateQueue.current.length > 0) {
        const c = candidateQueue.current.shift()
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c))
        } catch (e) {
          // skip invalid candidates
        }
      }
    }

    const run = async () => {
      try {
        destroyPeerConnection()

        const stream = await getLocalStream()
        if (cancelled) return

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
        pcRef.current = pc

        stream.getTracks().forEach(track => pc.addTrack(track, stream))

        if (isInitiator) {
          const dc = pc.createDataChannel('chat', { ordered: true })
          dc.onopen = () => { if (!cancelled) setDataChannel(dc) }
          dc.onclose = () => { if (!cancelled) setDataChannel(null) }
        } else {
          pc.ondatachannel = (event) => {
            const dc = event.channel
            dc.onopen = () => { if (!cancelled) setDataChannel(dc) }
            dc.onclose = () => { if (!cancelled) setDataChannel(null) }
          }
        }

        pc.ontrack = (event) => {
          if (!cancelled && event.streams[0]) {
            setRemoteStream(event.streams[0])
          }
        }

        pc.onicecandidate = async (event) => {
          if (event.candidate) {
            await supabase.from('ice_candidates').insert({
              match_id: matchId,
              sender_id: userId,
              candidate: event.candidate.toJSON(),
            })
          }
        }

        pc.onconnectionstatechange = () => {
          if (cancelled) return
          const state = pc.connectionState
          setConnectionState(state)
          if (state === 'connected' && timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
        }

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'failed') {
            pc.restartIce()
          }
        }

        timeoutId = setTimeout(() => {
          if (!cancelled && pcRef.current) {
            const state = pcRef.current.connectionState
            if (state !== 'connected') {
              setConnectionState('failed')
            }
          }
        }, CONNECTION_TIMEOUT)

        matchChannel = supabase
          .channel(`match-sig-${matchId}`)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'active_matches',
            filter: `id=eq.${matchId}`,
          }, async (payload) => {
            if (cancelled || !pcRef.current) return
            const currentPc = pcRef.current
            const { offer, answer } = payload.new

            if (offer && !isInitiator) {
              try {
                await currentPc.setRemoteDescription(new RTCSessionDescription(JSON.parse(offer)))
                const ans = await currentPc.createAnswer()
                await currentPc.setLocalDescription(ans)
                await supabase
                  .from('active_matches')
                  .update({ answer: JSON.stringify(ans) })
                  .eq('id', matchId)
                await processCandidateQueue(currentPc)
              } catch (e) {
                console.error('Offer handling error:', e)
              }
            }

            if (answer && isInitiator) {
              try {
                await currentPc.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)))
                await processCandidateQueue(currentPc)
              } catch (e) {
                console.error('Answer handling error:', e)
              }
            }
          })

        iceChannel = supabase
          .channel(`ice-sig-${matchId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'ice_candidates',
            filter: `match_id=eq.${matchId}`,
          }, async (payload) => {
            if (cancelled || !pcRef.current) return
            if (payload.new.sender_id === userId) return
            const candidate = payload.new.candidate

            if (pcRef.current.remoteDescription) {
              try {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate))
              } catch (e) {
                // skip invalid candidates
              }
            } else {
              candidateQueue.current.push(candidate)
            }
          })

        await Promise.all([
          new Promise(resolve => {
            matchChannel.subscribe((status) => {
              if (status === 'SUBSCRIBED') resolve()
            })
          }),
          new Promise(resolve => {
            iceChannel.subscribe((status) => {
              if (status === 'SUBSCRIBED') resolve()
            })
          }),
        ])

        if (cancelled || !pcRef.current) return

        const { data: matchData } = await supabase
          .from('active_matches')
          .select('offer, answer')
          .eq('id', matchId)
          .maybeSingle()

        if (cancelled || !pcRef.current) return

        if (isInitiator) {
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          await supabase
            .from('active_matches')
            .update({ offer: JSON.stringify(offer) })
            .eq('id', matchId)
        } else if (matchData?.offer && !matchData?.answer) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(matchData.offer)))
            const ans = await pc.createAnswer()
            await pc.setLocalDescription(ans)
            await supabase
              .from('active_matches')
              .update({ answer: JSON.stringify(ans) })
              .eq('id', matchId)
            await processCandidateQueue(pc)
          } catch (e) {
            console.error('Late offer handling error:', e)
          }
        }
      } catch (err) {
        console.error('WebRTC setup error:', err)
        if (!cancelled) setConnectionState('failed')
      }
    }

    run()

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
      destroyPeerConnection()
      if (matchChannel) supabase.removeChannel(matchChannel)
      if (iceChannel) supabase.removeChannel(iceChannel)
    }
  }, [matchId, userId, isInitiator])

  return {
    localStream,
    remoteStream,
    connectionState,
    dataChannel,
    toggleAudio,
    toggleVideo,
    closeConnection,
    destroyPeerConnection,
  }
}
