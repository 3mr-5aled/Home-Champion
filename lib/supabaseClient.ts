import { createClient } from "@supabase/supabase-js"

export const supabaseClient = async (supabaseToken: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error("Supabase URL is not defined")
  }

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
  if (!supabaseKey) {
    throw new Error("Supabase key is not defined")
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${supabaseToken}` } },
  })
  return supabase
}
