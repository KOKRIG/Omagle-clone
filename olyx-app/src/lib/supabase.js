import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://novlmdzpmghvllpqkvso.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdmxtZHpwbWdodmxscHFrdnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjUxODksImV4cCI6MjA4MzgwMTE4OX0.NF6-SOpBZL0u-_WB-PvrKI8SK_pAdEPqv69fhYA4zN4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
