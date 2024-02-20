import { createClient, SupabaseClient } from "@supabase/supabase-js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
export const supabase: SupabaseClient = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_ANON_KEY as string);
