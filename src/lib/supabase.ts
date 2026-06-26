import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://sjzrhlxliiwluwbvlnwi.supabase.co'

const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqenJobHhsaWl3bHV3YnZsbndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDgxNTEsImV4cCI6MjA5Nzg4NDE1MX0.R4-vao_BvjtC29K84Xq62IupZFRzTGqfouR1F3KxlLQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
