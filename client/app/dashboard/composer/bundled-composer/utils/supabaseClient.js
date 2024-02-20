import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASEURL, process.env.NEXT_PUBLIC_SUPABASEKEY)
