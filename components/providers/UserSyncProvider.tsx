"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

interface UserSyncProviderProps {
  children: React.ReactNode
}

export function UserSyncProvider({ children }: UserSyncProviderProps) {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded && user) {
      // Sync user data with Supabase when user is loaded
      syncUserWithSupabase(user)
    }
  }, [user, isLoaded])

  const syncUserWithSupabase = async (clerkUser: any) => {
    try {
      const userData = {
        clerk_user_id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        image_url: clerkUser.imageUrl,
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("clerk_user_id", clerkUser.id)
        .single()

      if (existingUser) {
        // Update existing user
        await supabase
          .from("users")
          .update({
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            image_url: userData.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq("clerk_user_id", clerkUser.id)
      } else {
        // Create new user
        await supabase.from("users").insert([userData])
      }
    } catch (error) {
      console.error("Error syncing user with Supabase:", error)
    }
  }

  return <>{children}</>
}
