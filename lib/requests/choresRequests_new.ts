import { Chore } from "@/common.types"
import { supabase } from "../supabaseClient"

export async function getChores({ userId }: { userId: string }) {
  try {
    // Fetch chores with related member data
    const { data: chores, error: choresError } = await supabase
      .from("chore")
      .select(
        `
        *,
        members:member_chore(
          member_id,
          count,
          date,
          member:members(*)
        )
      `
      )
      .eq("clerk_user_id", userId)

    if (choresError) {
      console.error("Error fetching chores:", choresError)
      return []
    }

    // Process the data to match the desired schema
    const processedChores = chores.map((chore) => {
      return {
        ...chore,
        members: chore.members.map((m: any) => ({
          ...m.member,
          count: m.count,
          date: m.date,
        })),
      }
    })

    return processedChores
  } catch (error) {
    console.error("Error fetching chores:", error)
    return []
  }
}

// Add a new chore
export const addChore = async ({
  userId,
  newChore,
}: {
  userId: string
  newChore: Partial<Chore>
}) => {
  try {
    // Get user from Supabase users table
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", userId)
      .single()

    if (!user) {
      console.error("User not found")
      return null
    }

    // Perform the insertion
    const { data, error } = await supabase
      .from("chore")
      .insert([
        {
          user_id: user.id,
          clerk_user_id: userId,
          ...newChore,
        },
      ])
      .select("*")

    if (error) {
      console.error("Error adding chore:", error.message)
      return null
    }

    return data
  } catch (error) {
    console.error("Error adding chore:", (error as Error).message)
    return null
  }
}

// Update a chore
export const updateChore = async ({ choreEdited }: { choreEdited: Chore }) => {
  try {
    const { data, error } = await supabase
      .from("chore")
      .update(choreEdited)
      .eq("id", choreEdited.id)
      .select("*")

    if (error) {
      console.error("Error updating chore:", error.message)
      return null
    }

    return data
  } catch (error) {
    console.error("Error updating chore:", (error as Error).message)
    return null
  }
}

// Delete a chore
export const deleteChore = async ({ choreId }: { choreId: number }) => {
  try {
    const { data, error } = await supabase
      .from("chore")
      .delete()
      .eq("id", choreId)
      .select("*")

    if (error) {
      console.error("Error deleting chore:", error.message)
      return null
    }

    return data
  } catch (error) {
    console.error("Error deleting chore:", (error as Error).message)
    return null
  }
}

// Get chore completion history
export const getChoreHistory = async ({ choreId }: { choreId: number }) => {
  try {
    const { data, error } = await supabase
      .from("member_chore")
      .select(
        `
        *,
        member:members(*)
      `
      )
      .eq("chore_id", choreId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching chore history:", error.message)
      return []
    }

    return data
  } catch (error) {
    console.error("Error fetching chore history:", (error as Error).message)
    return []
  }
}
