import { Member } from "@/common.types"
import { supabase } from "../supabaseClient"

export async function getMembers({ userId }: { userId: string }) {
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
    .eq("clerk_user_id", userId)

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
        members: [], // Will be populated if needed
      })),
      chore: member.chore.map((c: any) => ({
        id: c.chore.id,
        name: c.chore.name,
        count: c.count,
        date: c.date,
        points: c.chore.points,
        created_at: c.chore.created_at,
        members: [], // Will be populated if needed
      })),
    }
  })

  return processedMembers
}

// add a member
export const addMember = async ({
  userId,
  newMember,
}: {
  userId: string
  newMember: Partial<Member>
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
      .from("members")
      .insert([
        {
          user_id: user.id,
          clerk_user_id: userId,
          ...newMember,
        },
      ])
      .select("*")

    // Check if there's an error
    if (error) {
      console.error("Error adding member:", error.message)
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
  memberEdited,
}: {
  memberEdited: Member
}) => {
  try {
    const { data, error } = await supabase
      .from("members")
      .update(memberEdited)
      .eq("id", memberEdited.id)
      .select("*")

    if (error) {
      console.error("Error updating member:", error.message)
      return null
    }

    return data
  } catch (error) {
    console.error("Error updating member:", (error as Error).message)
    return null
  }
}

// delete a member
export const deleteMember = async ({ memberId }: { memberId: number }) => {
  try {
    const { data, error } = await supabase
      .from("members")
      .delete()
      .eq("id", memberId)
      .select("*")

    if (error) {
      console.error("Error deleting member:", error.message)
      return null
    }

    return data
  } catch (error) {
    console.error("Error deleting member:", (error as Error).message)
    return null
  }
}

// deduct points from a member
export const deductPoints = async ({
  memberId,
  points,
  reason,
}: {
  memberId: number
  points: number
  reason: string
}) => {
  try {
    // First, get the current member points
    const { data: member, error: fetchError } = await supabase
      .from("members")
      .select("points")
      .eq("id", memberId)
      .single()

    if (fetchError || !member) {
      console.error("Error fetching member:", fetchError?.message)
      return null
    }

    const newPoints = Math.max(0, member.points - points)

    // Update member points
    const { data: updatedMember, error: updateError } = await supabase
      .from("members")
      .update({ points: newPoints })
      .eq("id", memberId)
      .select("*")

    if (updateError) {
      console.error("Error updating member points:", updateError.message)
      return null
    }

    // Record the deduction
    const { error: deductionError } = await supabase
      .from("points_deduction")
      .insert([
        {
          member_id: memberId,
          points: points,
          reason: reason,
        },
      ])

    if (deductionError) {
      console.error("Error recording deduction:", deductionError.message)
      // Note: We don't return null here because the points were already updated
    }

    return updatedMember
  } catch (error) {
    console.error("Error deducting points:", (error as Error).message)
    return null
  }
}

// claim chore for a member
export const claimChore = async ({
  memberId,
  choreId,
}: {
  memberId: number
  choreId: number
}) => {
  try {
    // First, get the chore points
    const { data: chore, error: choreError } = await supabase
      .from("chore")
      .select("points")
      .eq("id", choreId)
      .single()

    if (choreError || !chore) {
      console.error("Error fetching chore:", choreError?.message)
      return null
    }

    // Get current member points
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("points")
      .eq("id", memberId)
      .single()

    if (memberError || !member) {
      console.error("Error fetching member:", memberError?.message)
      return null
    }

    // Update member points
    const newPoints = member.points + chore.points
    const { data: updatedMember, error: updateError } = await supabase
      .from("members")
      .update({ points: newPoints })
      .eq("id", memberId)
      .select("*")

    if (updateError) {
      console.error("Error updating member points:", updateError.message)
      return null
    }

    // Record the chore completion
    const { data: existingRecord } = await supabase
      .from("member_chore")
      .select("*")
      .eq("member_id", memberId)
      .eq("chore_id", choreId)
      .single()

    if (existingRecord) {
      // Update existing record
      const { error: updateChoreError } = await supabase
        .from("member_chore")
        .update({
          count: existingRecord.count + 1,
          date: [...existingRecord.date, new Date().toISOString()],
        })
        .eq("id", existingRecord.id)

      if (updateChoreError) {
        console.error("Error updating chore record:", updateChoreError.message)
      }
    } else {
      // Create new record
      const { error: insertChoreError } = await supabase
        .from("member_chore")
        .insert([
          {
            member_id: memberId,
            chore_id: choreId,
            count: 1,
            date: [new Date().toISOString()],
          },
        ])

      if (insertChoreError) {
        console.error("Error creating chore record:", insertChoreError.message)
      }
    }

    return updatedMember
  } catch (error) {
    console.error("Error claiming chore:", (error as Error).message)
    return null
  }
}

// redeem reward for a member
export const redeemReward = async ({
  memberId,
  rewardId,
}: {
  memberId: number
  rewardId: number
}) => {
  try {
    // First, get the reward points
    const { data: reward, error: rewardError } = await supabase
      .from("reward")
      .select("points")
      .eq("id", rewardId)
      .single()

    if (rewardError || !reward) {
      console.error("Error fetching reward:", rewardError?.message)
      return null
    }

    // Get current member points
    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("points")
      .eq("id", memberId)
      .single()

    if (memberError || !member) {
      console.error("Error fetching member:", memberError?.message)
      return null
    }

    // Check if member has enough points
    if (member.points < reward.points) {
      console.error("Insufficient points")
      return null
    }

    // Update member points
    const newPoints = member.points - reward.points
    const { data: updatedMember, error: updateError } = await supabase
      .from("members")
      .update({ points: newPoints })
      .eq("id", memberId)
      .select("*")

    if (updateError) {
      console.error("Error updating member points:", updateError.message)
      return null
    }

    // Record the reward redemption
    const { data: existingRecord } = await supabase
      .from("member_reward")
      .select("*")
      .eq("member_id", memberId)
      .eq("reward_id", rewardId)
      .single()

    if (existingRecord) {
      // Update existing record
      const { error: updateRewardError } = await supabase
        .from("member_reward")
        .update({
          count: existingRecord.count + 1,
          date: [...existingRecord.date, new Date().toISOString()],
        })
        .eq("id", existingRecord.id)

      if (updateRewardError) {
        console.error(
          "Error updating reward record:",
          updateRewardError.message
        )
      }
    } else {
      // Create new record
      const { error: insertRewardError } = await supabase
        .from("member_reward")
        .insert([
          {
            member_id: memberId,
            reward_id: rewardId,
            count: 1,
            date: [new Date().toISOString()],
          },
        ])

      if (insertRewardError) {
        console.error(
          "Error creating reward record:",
          insertRewardError.message
        )
      }
    }

    return updatedMember
  } catch (error) {
    console.error("Error redeeming reward:", (error as Error).message)
    return null
  }
}
