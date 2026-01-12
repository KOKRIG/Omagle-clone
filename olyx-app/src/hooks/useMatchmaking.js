import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useMatchmaking(userId, profile, filters) {
  const [matchStatus, setMatchStatus] = useState('idle') // idle, searching, found, failed
  const [matchedUser, setMatchedUser] = useState(null)
  const [matchId, setMatchId] = useState(null)
  const [error, setError] = useState(null)

  const isBanned = profile?.ban_until && new Date(profile.ban_until) > new Date()
  const isPaid = profile?.is_paid

  const joinQueue = useCallback(async () => {
    if (!userId || !profile) return

    try {
      // Add user to match queue
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
      // For banned users, reduce match probability (1 in 10)
      if (isBanned && Math.random() > 0.1) {
        return null
      }

      // Build query for potential matches
      let query = supabase
        .from('match_queue')
        .select('*')
        .neq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(10)

      const { data: candidates, error: queryError } = await query

      if (queryError) throw queryError
      if (!candidates || candidates.length === 0) return null

      // Filter candidates based on compatibility
      const compatibleMatches = candidates.filter((candidate) => {
        // Free plan: same-gender matching only
        if (!isPaid) {
          if (candidate.gender !== profile.gender) return false
        }

        // Paid plan with filters
        if (isPaid && !isBanned) {
          // Apply gender filter
          if (filters?.gender && filters.gender !== 'any') {
            if (candidate.gender !== filters.gender) return false
          }

          // Apply region filter
          if (filters?.region && filters.region !== '') {
            if (candidate.country !== filters.region) return false
          }

          // Check if candidate's filters accept us
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

      // Priority: paid users match first
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
      // Remove both users from queue
      await supabase
        .from('match_queue')
        .delete()
        .in('user_id', [userId, matchedUserId])

      // Create active match
      const { data: match, error: matchError } = await supabase
        .from('active_matches')
        .insert({
          user1_id: userId,
          user2_id: matchedUserId,
        })
        .select()
        .single()

      if (matchError) throw matchError

      // Update both users' presence
      await supabase
        .from('profiles')
        .update({ presence: 'in_chat' })
        .in('id', [userId, matchedUserId])

      return match
    } catch (err) {
      console.error('Failed to create match:', err)
      return null
    }
  }, [userId])

  const endMatch = useCallback(async () => {
    if (!matchId || !userId) return

    try {
      // Delete ice candidates
      await supabase.from('ice_candidates').delete().eq('match_id', matchId)

      // Delete the match
      await supabase.from('active_matches').delete().eq('id', matchId)

      // Update presence
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

  // Automatic match searching
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
    }, 2000) // Check every 2 seconds

    return () => clearInterval(searchInterval)
  }, [matchStatus, findMatch, createMatch])

  // Listen for incoming matches
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
          // We were matched by another user
          const match = payload.new

          // Get the other user's info
          const { data: otherUser } = await supabase
            .from('profiles')
            .select('id, full_name, gender, country')
            .eq('id', match.user1_id)
            .single()

          if (otherUser) {
            // Remove ourselves from queue
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
    joinQueue,
    leaveQueue,
    endMatch,
  }
}
