import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fnyotegsvnfhsimajggw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZueW90ZWdzdm5maHNpbWFqZ2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NDE5MDQsImV4cCI6MjA2NjAxNzkwNH0.BaOdV_LjesyK18XocJKqXaSGfVqg4pLRzwjFcC4IiE0'

export const supabase = createClient(supabaseUrl, supabaseKey)
