import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useVisitorCount() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const visitorId = crypto.randomUUID()

    const channel = supabase.channel('site-visitors', {
      config: { presence: { key: visitorId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setCount(Object.keys(state).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return count
}
