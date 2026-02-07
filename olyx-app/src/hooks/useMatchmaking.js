import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const MATCHING_PATTERNS = [
  [1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
  [1, 1, 1, 0, 0, 1, 1, 1, 0, 0],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [0, 1, 1, 1, 1, 1, 1, 0, 1, 1],
]

const getMatchingGenderForPattern = (profile) => {
  const patternIndex = (profile.match_pattern_seed || 0) % MATCHING_PATTERNS.length
  const pattern = MATCHING_PATTERNS[patternIndex]
  const position = (profile.match_pattern_position || 0) % pattern.length
  return pattern[position] === 1 ? profile.gender : (profile.gender === 'male' ? 'female' : 'male')
}

export function useMatchmaking(userId, profile, filters) {
  const [matchStatus, setMatchStatus] = useState('idle')
  const [matchedUser, setMatchedUser] = useState(null)
  const [matchId, setMatchId] = useState(null)
  const [isMatchCreator, setIsMatchCreator] = useState(false)
  const [error, setError] = useState(null)
  const [onlineCount, setOnlineCount] = useState(0)
  const [searchDuration, setSearchDuration] = useState(0)

  const matchingRef = useRef(false)

  const isBanned = profile?.ban_until && new Date(profile.ban_until) > new Date()
  const hasAdPremium = profile?.ad_premium_expires_at && new Date(profile.ad_premium_expires_at) > new Date()
  const isPaid = profile?.is_paid || hasAdPremium

  const joinQueue = useCallback(async () => {
    if (!userId || !profile) return

    try {
      const { error: queueError } = await supabase.from('match_queue').upsert({
        user_id: userId,
        gender: profile.gender,
        country: profile.country,
        is_paid: isPaid,
        filter_gender: isPaid && !isBanned ? filters?.gender : null,
        filter_region: isPaid && !isBanned ? filters?.region : null,
      })

      if (queueError) throw queueError

      setMatchStatus('searching')
      setSearchDuration(0)
      matchingRef.current = false
      setIsMatchCreator(false)

      const { count } = await supabase
        .from('match_queue')
        .select('*', { count: 'exact', head: true })

      setOnlineCount(count || 0)
    } catch (err) {
      setError(err.message)
      setMatchStatus('failed')
    }
  }, [userId, profile, filters, isPaid, isBanned])

  const leaveQueue = useCallback(async () => {
    if (!userId) return

    try {
      await supabase.from('match_queue').delete().eq('user_id', userId)

      await supabase
        .from('profiles')
        .update({ presence: 'online' })
        .eq('id', userId)

      setMatchStatus('idle')
      setMatchedUser(null)
      setMatchId(null)
      setIsMatchCreator(false)
      matchingRef.current = false
    } catch (err) {
      console.error('Failed to leave queue:', err)
    }
  }, [userId])

  const findMatch = useCallback(async () => {
    if (!userId || !profile || matchingRef.current) return null

    try {
      if (isBanned && Math.random() > 0.1) return null

      const { data: candidates, error: queryError } = await supabase
        .from('match_queue')
        .select('*')
        .neq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(10)

      if (queryError) throw queryError
      if (!candidates || candidates.length === 0) return null

      const compatibleMatches = candidates.filter((candidate) => {
        if (!isPaid) {
          const expectedGender = getMatchingGenderForPattern(profile)
          if (candidate.gender !== expectedGender) return false
        }

        if (isPaid && !isBanned) {
          if (filters?.gender && filters.gender !== 'any') {
            if (candidate.gender !== filters.gender) return false
          }
          if (filters?.region && filters.region !== '') {
            if (candidate.country !== filters.region) return false
          }
          if (candidate.is_paid) {
            if (candidate.filter_gender && candidate.filter_gender !== 'any') {
              if (profile.gender !== candidate.filter_gender) return false
            }
            if (candidate.filter_region && candidate.filter_region !== '') {
              if (profile.country !== candidate.filter_region) return false
            }
          }
        }

        return true
      })

      if (compatibleMatches.length === 0) return null

      const sortedMatches = compatibleMatches.sort((a, b) => {
        if (a.is_paid && !b.is_paid) return -1
        if (!a.is_paid && b.is_paid) return 1
        return new Date(a.created_at) - new Date(b.created_at)
      })

      return sortedMatches[0]
    } catch (err) {
      console.error('Match finding error:', err)
      return null
    }
  }, [userId, profile, filters, isPaid, isBanned])

  const createMatch = useCallback(async (candidate) => {
    if (!userId || matchingRef.current) return null
    matchingRef.current = true

    const matchedUserId = candidate.user_id

    try {
      const { data: existing } = await supabase
        .from('active_matches')
        .select('id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId},user1_id.eq.${matchedUserId},user2_id.eq.${matchedUserId}`)
        .limit(1)

      if (existing && existing.length > 0) {
        matchingRef.current = false
        return null
      }

      await supabase.from('match_queue').delete().eq('user_id', userId)

      const { data: match, error: matchError } = await supabase
        .from('active_matches')
        .insert({
          user1_id: userId,
          user2_id: matchedUserId,
        })
        .select()
        .maybeSingle()

      if (matchError || !match) {
        matchingRef.current = false
        return null
      }

      await supabase
        .from('profiles')
        .update({ presence: 'in_chat' })
        .eq('id', userId)

      await supabase.rpc('increment_match_count', { user_id_param: userId }).catch(() => {})
      await supabase.rpc('increment_match_count', { user_id_param: matchedUserId }).catch(() => {})

      const patternIndex = (profile.match_pattern_seed || 0) % MATCHING_PATTERNS.length
      const pattern = MATCHING_PATTERNS[patternIndex]
      const currentPosition = profile.match_pattern_position || 0
      const newPosition = (currentPosition + 1) % pattern.length
      await supabase
        .from('profiles')
        .update({ match_pattern_position: newPosition })
        .eq('id', userId)

      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('id, full_name, gender, country')
        .eq('id', matchedUserId)
        .maybeSingle()

      return {
        match,
        otherUser: otherProfile || { id: matchedUserId, gender: candidate.gender, country: candidate.country },
      }
    } catch (err) {
      console.error('Failed to create match:', err)
      matchingRef.current = false
      return null
    }
  }, [userId, profile])

  const endMatch = useCallback(async () => {
    if (!matchId || !userId) return

    try {
      await supabase.from('active_matches').delete().eq('id', matchId)

      await supabase
        .from('profiles')
        .update({ presence: 'online' })
        .eq('id', userId)

      setMatchStatus('idle')
      setMatchedUser(null)
      setMatchId(null)
      setIsMatchCreator(false)
      matchingRef.current = false
    } catch (err) {
      console.error('Failed to end match:', err)
    }
  }, [matchId, userId])

  useEffect(() => {
    if (matchStatus !== 'searching') return

    const jitter = Math.floor(Math.random() * 1000)

    const searchInterval = setInterval(async () => {
      const candidate = await findMatch()

      if (candidate) {
        const result = await createMatch(candidate)

        if (result) {
          setMatchedUser(result.otherUser)
          setMatchId(result.match.id)
          setIsMatchCreator(true)
          setMatchStatus('found')
        }
      }

      const { count } = await supabase
        .from('match_queue')
        .select('*', { count: 'exact', head: true })

      setOnlineCount(count || 0)
    }, 2500 + jitter)

    const durationInterval = setInterval(() => {
      setSearchDuration((prev) => prev + 1)
    }, 1000)

    return () => {
      clearInterval(searchInterval)
      clearInterval(durationInterval)
    }
  }, [matchStatus, findMatch, createMatch])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`match-notify-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'active_matches',
          filter: `user2_id=eq.${userId}`,
        },
        async (payload) => {
          const match = payload.new

          const { data: otherUser } = await supabase
            .from('profiles')
            .select('id, full_name, gender, country')
            .eq('id', match.user1_id)
            .maybeSingle()

          if (otherUser) {
            await supabase.from('match_queue').delete().eq('user_id', userId)

            await supabase
              .from('profiles')
              .update({ presence: 'in_chat' })
              .eq('id', userId)

            setMatchedUser(otherUser)
            setMatchId(match.id)
            setIsMatchCreator(false)
            setMatchStatus('found')
            matchingRef.current = false
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return {
    matchStatus,
    matchedUser,
    matchId,
    isMatchCreator,
    error,
    onlineCount,
    searchDuration,
    joinQueue,
    leaveQueue,
    endMatch,
  }
}
