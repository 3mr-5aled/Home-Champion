import { Chore } from "@/common.types"
import { supabaseClient } from "../supabaseClient"

// get chores
export async function getChores({
  userId,
  token,
}: {
  userId: string
  token: string
}) {
  const supabase = await supabaseClient(token)

  // Fetch chores with related member_chore and members data
  const { data: chores, error } = await supabase
    .from("chore")
    .select(
      `
      *,
      member_chore (
        date,
        count,
        member_id,
        chore_id
      ),
      members!member_chore(id, name, points)
    `
    )
    .eq("user_id", userId)
    .eq("status", "active")

  if (error) {
    console.error("Error fetching chores:", error)
    return []
  }

  // Merge member_chore data into members object
  chores.forEach((chore) => {
    chore.members = chore.members.map((member: any) => {
      const memberChore = chore.member_chore.find(
        (mc: any) => mc.member_id === member.id
      )
      return memberChore
        ? { ...member, count: memberChore.count, date: memberChore.date }
        : member
    })
  })

  // Log and return the chores
  console.log(chores)
  return chores
}

// get members for rewards
export async function getMembersChores({
  userId,
  token,
}: {
  userId: string
  token: string
}) {
  const supabase = await supabaseClient(token)
  const { data: members, error } = await supabase
    .from("members")
    .select("id,name,points,role")
    .eq("user_id", userId)
  if (error) {
    console.log(error)
    return
  }

  return members
}

// add a chore
export const addChore = async ({
  userId,
  token,
  newChore,
}: {
  userId: string
  token: string
  newChore: any
}) => {
  const supabase = await supabaseClient(token)
  try {
    // Perform the insertion
    const { data, error } = await supabase
      .from("chore") // Replace 'chores' with your actual table name
      .insert([{ user_id: userId, ...newChore }])
      .select("*") // Ensure single is used if inserting one record

    // Check if there's an error
    if (error) {
      console.error("Error adding chore:", (error as unknown as Error).message)
      return null
    }

    // Return the inserted data
    return data
  } catch (error) {
    console.error("Error adding chore:", (error as Error).message)
    return null
  }
}

// update a chore
export const updateChore = async ({
  token,
  choreEdited,
}: {
  token: string
  choreEdited: { id: string; name: string; points: number }
}) => {
  const supabase = await supabaseClient(token)
  try {
    const { data, error } = await supabase
      .from("chore")
      .update({
        // Add the fields you want to update here
        name: choreEdited.name,
        points: choreEdited.points,
      })
      .eq("id", choreEdited.id)
      .select("*")

    // Check if there's an error
    if (error) {
      console.error(
        "Error updating chore:",
        (error as unknown as Error).message
      )
      return null
    }

    // Return the updated data
    return data
  } catch (error) {
    console.error("Error updating chore:", (error as Error).message)
    return null
  }
}

// Delete a chore (update status into removed)
export const deleteChore = async ({
  token,
  choreToDelete,
}: {
  token: string
  choreToDelete: Chore
}): Promise<boolean> => {
  const supabase = await supabaseClient(token)

  try {
    const { error } = await supabase
      .from("chore")
      .update({ status: "removed" })
      .eq("id", choreToDelete.id)

    if (error) {
      console.error("Error updating chore status to removed:", error.message)
      return false
    }

    return true
  } catch (error) {
    console.error("Error deleting chore:", (error as Error).message)
    return false
  }
}

// Get removed chores
export const getDeletedChore = async ({
  userId,
  token,
}: {
  userId: string
  token: string
}) => {
  const supabase = await supabaseClient(token)
  const { data: removedChores, error } = await supabase
    .from("chore")
    .select("*")
    .eq("status", "removed")
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching removed chores:", error.message)
    return []
  }

  return removedChores
}

// Permanently delete a chore and any related data
export const deleteChorePermanently = async ({
  token,
  choreToDelete,
}: {
  token: string
  choreToDelete: Chore
}): Promise<boolean> => {
  const supabase = await supabaseClient(token)

  try {
    // Check if the chore is related to any members
    const { data: memberChores, error: memberChoreError } = await supabase
      .from("member_chore")
      .select("member_id, count")
      .eq("chore_id", choreToDelete.id)

    if (memberChoreError) {
      console.error("Error fetching member chores:", memberChoreError.message)
      return false
    }

    if (memberChores.length > 0) {
      // Chore is related to members, deduct points and delete related items
      for (const memberChore of memberChores) {
        const { member_id, count } = memberChore

        // Fetch chore details to get points
        const { data: choreData, error: choreError } = await supabase
          .from("chore")
          .select("points")
          .eq("id", choreToDelete.id)
          .single()

        if (choreError) {
          console.error("Error fetching chore details:", choreError.message)
          return false
        }

        const { points } = choreData

        // Deduct points from the member
        const { error: memberError } = await supabase
          .from("members")
          .update({
            points: supabase.rpc("subtract_points", { points: points * count }),
          })
          .eq("id", member_id)

        if (memberError) {
          console.error(
            "Error deducting points from member:",
            memberError.message
          )
          return false
        }

        // Delete related item from member_chore
        const { error: deleteMemberChoreError } = await supabase
          .from("member_chore")
          .delete()
          .eq("id", (memberChore as any).id)

        if (deleteMemberChoreError) {
          console.error(
            "Error deleting member chore:",
            deleteMemberChoreError.message
          )
          return false
        }
      }
    }

    // Delete the chore from chores table
    const { error: deleteChoreError } = await supabase
      .from("chore")
      .delete()
      .eq("id", choreToDelete.id)

    if (deleteChoreError) {
      console.error("Error deleting chore:", deleteChoreError.message)
      return false
    }

    return true
  } catch (error) {
    console.error("Error deleting chore permanently:", (error as Error).message)
    return false
  }
}

interface CheckChoreRelationParams {
  token: string
  choreToDelete: Chore
}

export const checkChoreRelation = async ({
  token,
  choreToDelete,
}: CheckChoreRelationParams): Promise<{ isRelated: boolean }> => {
  const supabase = await supabaseClient(token)

  const { data, error } = await supabase
    .from("member_chore")
    .select("id")
    .eq("chore_id", choreToDelete.id)
    .single()

  if (error) {
    console.error("Error checking chore relation:", error)
    return { isRelated: false }
  }

  return { isRelated: !!data }
}

// Claim a chore
export const claimChore = async ({
  token,
  chore,
  member,
}: {
  token: string
  chore: { id: string; points: number }
  member: { id: string; points: number }
}) => {
  const supabase = await supabaseClient(token)
  try {
    // Increment member's points
    const updatedMember = {
      ...member,
      points: member.points + chore.points,
    }

    // Update member's points in the database
    const { data: memberData, error: memberError } = await supabase
      .from("members")
      .update({ points: updatedMember.points })
      .eq("id", member.id)
      .select("*")

    if (memberError) {
      console.error("Error updating member's points:", memberError.message)
      return null
    }
    console.log("Updated member points:", memberData)

    // Check if the member has already claimed this chore
    const { data: existingMemberChore, error: fetchError } = await supabase
      .from("member_chore")
      .select("*")
      .eq("member_id", member.id)
      .eq("chore_id", chore.id)
      .single()

    if (fetchError && (fetchError as any).code !== "PGRST116") {
      console.error("Error fetching existing member chore:", fetchError.message)
      return null
    }
    console.log("Existing member chore:", existingMemberChore)

    if (existingMemberChore) {
      // Update the existing entry
      const updatedMemberChore = {
        ...existingMemberChore,
        count: existingMemberChore.count + 1,
        date: [...existingMemberChore.date, new Date().toISOString()],
      }

      const { data: memberChoreData, error: memberChoreError } = await supabase
        .from("member_chore")
        .update(updatedMemberChore)
        .eq("member_id", member.id)
        .eq("chore_id", chore.id)
        .select("*")

      if (memberChoreError) {
        console.error("Error updating member_chore:", memberChoreError.message)
        return null
      }
      console.log("Updated member chore:", memberChoreData)

      return { memberData, memberChoreData }
    } else {
      // Insert a new entry into the member_chore table
      const { data: memberChoreData, error: memberChoreError } = await supabase
        .from("member_chore")
        .insert([
          {
            member_id: member.id,
            chore_id: chore.id,
            count: 1,
            date: [new Date().toISOString()],
          },
        ])
        .select("*")

      if (memberChoreError) {
        console.error(
          "Error inserting into member_chore:",
          memberChoreError.message
        )
        return null
      }
      console.log("Inserted new member chore:", memberChoreData)

      return { memberData, memberChoreData }
    }
  } catch (error) {
    console.error("Error claiming chore:", (error as Error).message)
    return null
  }
}
