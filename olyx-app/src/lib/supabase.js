import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://novlmdzpmghvllpqkvso.supabase.co'
const supabaseAnonKey = 'sb_publishable__IOGUpF4LHAAk5ljnr1NLA_2AnoTrJV'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
