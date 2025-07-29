import { createClient } from "@supabase/supabase-js"

// Standard Supabase client (for general use)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Supabase client with user token (for authenticated requests)
export const supabaseClient = async (supabaseToken: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error("Supabase URL is not defined")
  }

  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseKey) {
    throw new Error("Supabase key is not defined")
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${supabaseToken}` } },
  })
  return supabase
}

// Helper function to get Clerk user token and create authenticated Supabase client
export const getAuthenticatedSupabaseClient = async () => {
  // This will be used in server components or API routes with Clerk
  // For client components, you'll need to pass the token from useAuth()
  return supabase
}
