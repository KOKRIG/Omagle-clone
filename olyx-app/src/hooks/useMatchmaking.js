import { useState, useEffect, useCallback } from 'react'
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
  const [error, setError] = useState(null)
  const [onlineCount, setOnlineCount] = useState(0)
  const [searchDuration, setSearchDuration] = useState(0)

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
    } catch (err) {
      console.error('Failed to leave queue:', err)
    }
  }, [userId])

  const findMatch = useCallback(async () => {
    if (!userId || !profile) return null

    try {
      if (isBanned && Math.random() > 0.1) {
        return null
      }

      let query = supabase
        .from('match_queue')
        .select('*')
        .neq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(10)

      const { data: candidates, error: queryError } = await query

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

  const createMatch = useCallback(async (matchedUserId) => {
    if (!userId) return null

    try {
      await supabase
        .from('match_queue')
        .delete()
        .in('user_id', [userId, matchedUserId])

      const { data: match, error: matchError } = await supabase
        .from('active_matches')
        .insert({
          user1_id: userId,
          user2_id: matchedUserId,
        })
        .select()
        .single()

      if (matchError) throw matchError

      await supabase
        .from('profiles')
        .update({ presence: 'in_chat' })
        .in('id', [userId, matchedUserId])

      await supabase.rpc('increment_match_count', {
        user_id_param: userId
      })
      await supabase.rpc('increment_match_count', {
        user_id_param: matchedUserId
      })

      const patternIndex = (profile.match_pattern_seed || 0) % MATCHING_PATTERNS.length
      const pattern = MATCHING_PATTERNS[patternIndex]
      const currentPosition = profile.match_pattern_position || 0
      const newPosition = (currentPosition + 1) % pattern.length
      await supabase
        .from('profiles')
        .update({ match_pattern_position: newPosition })
        .eq('id', userId)

      return match
    } catch (err) {
      console.error('Failed to create match:', err)
      return null
    }
  }, [userId, profile])

  const endMatch = useCallback(async () => {
    if (!matchId || !userId) return

    try {
      await supabase.from('ice_candidates').delete().eq('match_id', matchId)

      await supabase.from('active_matches').delete().eq('id', matchId)

      await supabase
        .from('profiles')
        .update({ presence: 'online' })
        .eq('id', userId)

      setMatchStatus('idle')
      setMatchedUser(null)
      setMatchId(null)
    } catch (err) {
      console.error('Failed to end match:', err)
    }
  }, [matchId, userId])

  useEffect(() => {
    if (matchStatus !== 'searching') return

    const searchInterval = setInterval(async () => {
      const match = await findMatch()

      if (match) {
        const createdMatch = await createMatch(match.user_id)

        if (createdMatch) {
          setMatchedUser(match)
          setMatchId(createdMatch.id)
          setMatchStatus('found')
        }
      }

      const { count } = await supabase
        .from('match_queue')
        .select('*', { count: 'exact', head: true })

      setOnlineCount(count || 0)
    }, 2000)

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

    const subscription = supabase
      .channel('match_updates')
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
            .single()

          if (otherUser) {
            await supabase.from('match_queue').delete().eq('user_id', userId)

            setMatchedUser(otherUser)
            setMatchId(match.id)
            setMatchStatus('found')
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  return {
    matchStatus,
    matchedUser,
    matchId,
    error,
    onlineCount,
    searchDuration,
    joinQueue,
    leaveQueue,
    endMatch,
  }
}
