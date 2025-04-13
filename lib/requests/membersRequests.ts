import { Member } from "@/common.types"
import { supabaseClient } from "../supabaseClient"

export async function getMembers({
  userId,
  token,
}: {
  userId: string
  token: string
}) {
  const supabase = await supabaseClient(token)

  // Fetch members with related rewards and chores
  const { data: members, error: membersError } = await supabase
    .from("members")
    .select(
      `
      *,
      reward:member_reward(
        reward_id,
        count,
        date,
        reward:reward(*)
      ),
      chore:member_chore(
        chore_id,
        count,
        date,
        chore:chore(*)
      )
    `
    )
    .eq("user_id", userId)

  if (membersError) {
    console.error("Error fetching members:", membersError)
    return []
  }

  // Process the data to match the desired schema
  const processedMembers = members.map((member) => {
    return {
      ...member,
      reward: member.reward.map((r: any) => ({
        id: r.reward.id,
        name: r.reward.name,
        count: r.count,
        date: r.date,
        points: r.reward.points,
        created_at: r.reward.created_at,
        description: r.reward.description,
      })),
      chore: member.chore.map((c: any) => ({
        id: c.chore.id,
        name: c.chore.name,
        count: c.count,
        date: c.date,
        points: c.chore.points,
        members: c.chore.members,
        created_at: c.chore.created_at,
      })),
    }
  })

  return processedMembers
}

// add a member
export const addMember = async ({
  userId,
  token,
  newMember,
}: {
  userId: string
  token: string
  newMember: Partial<Member>
}) => {
  const supabase = await supabaseClient(token)
  try {
    // Perform the insertion
    const { data, error } = await supabase
      .from("members") // Replace 'members' with your actual table name
      .insert([{ user_id: userId, ...newMember }])
      .select("*") // Ensure single is used if inserting one record

    // Check if there's an error
    if (error) {
      console.error("Error adding member:", (error as unknown as Error).message)
      return null
    }

    // Return the inserted data
    return data
  } catch (error) {
    console.error("Error adding member:", (error as Error).message)
    return null
  }
}

// update a member
export const updateMember = async ({
  token,
  memberEdited,
}: {
  token: string
  memberEdited: { id: string; name: string; role: string }
}) => {
  const supabase = await supabaseClient(token)
  try {
    const { data, error } = await supabase
      .from("members")
      .update({
        // Add the fields you want to update here
        name: memberEdited.name,
        role: memberEdited.role,
        // Add other fields as needed
      })
      .eq("id", memberEdited.id)
      .select("*")

    // Check if there's an error
    if (error) {
      console.error(
        "Error updating member:",
        (error as unknown as Error).message
      )
      return null
    }

    // Return the updated data
    return data
  } catch (error) {
    console.error("Error updating member:", (error as Error).message)
    return null
  }
}

// Delete a Member
export const deleteMember = async ({
  token,
  memberToDelete,
}: {
  token: string
  memberToDelete: { id: string }
}) => {
  const supabase = await supabaseClient(token)
  const response = await supabase
    .from("members")
    .delete()
    .eq("id", memberToDelete.id)
  return response
}
// Deduce points from a Member
export const deductPoints = async ({
  token,
  memberData,
  pointsToDeduct,
  reason,
}: {
  token: string
  memberData: Member
  pointsToDeduct: number
  reason: string
}) => {
  const supabase = await supabaseClient(token)
  try {
    // Calculate new points
    const newPoints = memberData.points - pointsToDeduct // Ensure points don't go below 0
    // Create new pointsDeducted entry
    const newPointsDeducted = {
      date: new Date().toISOString(),
      points: pointsToDeduct,
      reason: reason,
    }

    // Update the member
    const { data, error } = await supabase
      .from("members")
      .update({
        points: newPoints,
        pointsDeducted: [
          ...(memberData.pointsDeducted || []),
          newPointsDeducted,
        ],
      })
      .eq("id", memberData.id)
      .select()

    if (error) {
      console.error("Error deducting points:", error.message)
      return null
    }
    // Return the updated member data
    return data
  } catch (error) {
    console.error("Error deducting points:", error)
    return null
  }
}

// delete Related Chore
export const deleteRelatedChore = async ({
  token,
  memberId,
  choreId,
}: {
  token: string
  memberId: string
  choreId: string
}) => {
  const supabase = await supabaseClient(token)

  const { error } = await supabase
    .from("member_chore")
    .delete()
    .eq("member_id", memberId)
    .eq("chore_id", choreId)
    .single()

  if (error) {
    console.error("Error deleting related chore:", error)
    return false
  }
  return true
}

// delete Related Reward
export const deleteRelatedReward = async ({
  token,
  memberId,
  rewardId,
}: {
  token: string
  memberId: string
  rewardId: string
}) => {
  const supabase = await supabaseClient(token)

  const { error } = await supabase
    .from("member_reward")
    .delete()
    .eq("member_id", memberId)
    .eq("reward_id", rewardId)
    .single()

  if (error) {
    console.error("Error deleting related reward:", error)
    return false
  }
  return true
}

// delete punishment ( points deducted)
export const deletePunishment = async ({
  token,
  member,
  punishmentIndex,
}: {
  token: string
  member: Member
  punishmentIndex: number
}) => {
  const supabase = await supabaseClient(token)

  const updatedDeductions = [...(member.pointsDeducted || [])]
  const pointsToAdd = updatedDeductions[punishmentIndex]?.points || 0

  updatedDeductions.splice(punishmentIndex, 1)

  const { error } = await supabase
    .from("members")
    .update({
      pointsDeducted: updatedDeductions,
      points: member.points + pointsToAdd,
    })
    .eq("id", member.id)

  if (error) {
    console.error("Error deleting punishment:", error)
    return false
  }
  return true
}
