"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function UserSyncProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useUser()

  useEffect(() => {
    if (!user) return

    const syncUser = async () => {
      try {
        // Check if user exists in our database
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("clerk_user_id", user.id)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error checking user:", fetchError)
          return
        }

        // If user doesn't exist, create them
        if (!existingUser) {
          const { error: insertError } = await supabase.from("users").insert({
            clerk_user_id: user.id,
            email: user.emailAddresses[0]?.emailAddress || "",
            first_name: user.firstName || "",
            last_name: user.lastName || "",
          })

          if (insertError) {
            console.error("Error creating user:", insertError)
          } else {
            console.log("User synced successfully")
          }
        }
      } catch (error) {
        console.error("Error syncing user:", error)
      }
    }

    syncUser()
  }, [user])

  return <>{children}</>
}
