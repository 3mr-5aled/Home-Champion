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
      .is("deleted_at", null)

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
    // Directly insert with clerk_user_id
    const { data, error } = await supabase
      .from("chore")
      .insert([
        {
          clerk_user_id: userId,
          name: newChore.name,
          points: newChore.points || 0,
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
    // Only include columns that exist in the database
    const updateData = {
      name: choreEdited.name,
      points: choreEdited.points,
    }

    const { data, error } = await supabase
      .from("chore")
      .update(updateData)
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

// Delete a chore (soft delete to preserve member data)
export const deleteChore = async ({ choreId }: { choreId: number }) => {
  try {
    // Instead of hard delete, mark as deleted to preserve member relationship data
    const { data, error } = await supabase
      .from("chore")
      .update({ deleted_at: new Date().toISOString() })
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

// Hard delete a chore (removes all completion data and affects member points)
export const hardDeleteChore = async ({ choreId }: { choreId: number }) => {
  try {
    // First, get all member completions for this chore to deduct points
    const { data: completions, error: completionsError } = await supabase
      .from("member_chore")
      .select("member_id, count, chore:chore(points)")
      .eq("chore_id", choreId)

    if (completionsError) {
      console.error("Error fetching completions:", completionsError.message)
      return null
    }

    // Deduct points from members
    if (completions && completions.length > 0) {
      for (const completion of completions) {
        const pointsToDeduct =
          completion.count * (completion.chore as any).points

        // Get current member points
        const { data: member, error: memberError } = await supabase
          .from("members")
          .select("points")
          .eq("id", completion.member_id)
          .single()

        if (memberError || !member) continue

        // Update member points (allow negative)
        await supabase
          .from("members")
          .update({ points: member.points - pointsToDeduct })
          .eq("id", completion.member_id)
      }
    }

    // Delete member_chore relationships
    await supabase.from("member_chore").delete().eq("chore_id", choreId)

    // Delete the chore itself
    const { data, error } = await supabase
      .from("chore")
      .delete()
      .eq("id", choreId)
      .select("*")

    if (error) {
      console.error("Error hard deleting chore:", error.message)
      return null
    }

    return data
  } catch (error) {
    console.error("Error hard deleting chore:", (error as Error).message)
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

// Claim a chore (member completes a chore)
export const claimChore = async ({
  memberId,
  choreId,
}: {
  memberId: number
  choreId: number
}) => {
  try {
    // First get the chore points
    const { data: chore, error: choreError } = await supabase
      .from("chore")
      .select("points")
      .eq("id", choreId)
      .single()

    if (choreError) {
      console.error("Error fetching chore:", choreError.message)
      return null
    }

    // Update member points
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("points")
      .eq("id", memberId)
      .single()

    if (memberError) {
      console.error("Error fetching member:", memberError.message)
      return null
    }

    const newPoints = (member.points || 0) + (chore.points || 0)

    const { data: updatedMember, error: updateError } = await supabase
      .from("members")
      .update({ points: newPoints })
      .eq("id", memberId)
      .select("*")

    if (updateError) {
      console.error("Error updating member points:", updateError.message)
      return null
    }

    // Record the chore completion or update existing record
    // First check if a record already exists
    const { data: existingRecord, error: checkError } = await supabase
      .from("member_chore")
      .select("*")
      .eq("member_id", memberId)
      .eq("chore_id", choreId)
      .single()

    let completion
    if (existingRecord) {
      // Update existing record by incrementing count and appending new date
      const { data: updatedCompletion, error: updateCompletionError } =
        await supabase
          .from("member_chore")
          .update({
            count: (existingRecord.count || 0) + 1,
            date: [...(existingRecord.date || []), new Date().toISOString()],
          })
          .eq("member_id", memberId)
          .eq("chore_id", choreId)
          .select("*")

      if (updateCompletionError) {
        console.error(
          "Error updating chore completion:",
          updateCompletionError.message
        )
        return null
      }
      completion = updatedCompletion
    } else {
      // Create new record
      const { data: newCompletion, error: completionError } = await supabase
        .from("member_chore")
        .insert([
          {
            member_id: memberId,
            chore_id: choreId,
            count: 1,
            // Let the database handle the date array with its default value
          },
        ])
        .select("*")

      if (completionError) {
        console.error(
          "Error recording chore completion:",
          completionError.message
        )
        return null
      }
      completion = newCompletion
    }

    return {
      member: updatedMember[0],
      completion: completion?.[0],
      pointsEarned: chore.points,
    }
  } catch (error) {
    console.error("Error claiming chore:", (error as Error).message)
    return null
  }
}
