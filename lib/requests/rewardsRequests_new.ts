import { Reward } from "@/common.types"
import { supabase } from "../supabaseClient"

export async function getRewards({ userId }: { userId: string }) {
  try {
    // Fetch rewards with related member data
    const { data: rewards, error: rewardsError } = await supabase
      .from("reward")
      .select(
        `
        *,
        members:member_reward(
          member_id,
          count,
          date,
          member:members(*)
        )
      `
      )
      .eq("clerk_user_id", userId)

    if (rewardsError) {
      console.error("Error fetching rewards:", rewardsError)
      return []
    }

    // Process the data to match the desired schema
    const processedRewards = rewards.map((reward) => {
      return {
        ...reward,
        members: reward.members.map((m: any) => ({
          ...m.member,
          count: m.count,
          date: m.date,
        })),
      }
    })

    return processedRewards
  } catch (error) {
    console.error("Error fetching rewards:", error)
    return []
  }
}

// Add a new reward
export const addReward = async ({
  userId,
  newReward,
}: {
  userId: string
  newReward: Partial<Reward>
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
      .from("reward")
      .insert([
        {
          user_id: user.id,
          clerk_user_id: userId,
          ...newReward,
        },
      ])
      .select("*")

    if (error) {
      console.error("Error adding reward:", error.message)
      return null
    }

    return data
  } catch (error) {
    console.error("Error adding reward:", (error as Error).message)
    return null
  }
}

// Update a reward
export const updateReward = async ({
  rewardEdited,
}: {
  rewardEdited: Reward
}) => {
  try {
    const { data, error } = await supabase
      .from("reward")
      .update(rewardEdited)
      .eq("id", rewardEdited.id)
      .select("*")

    if (error) {
      console.error("Error updating reward:", error.message)
      return null
    }

    return data
  } catch (error) {
    console.error("Error updating reward:", (error as Error).message)
    return null
  }
}

// Delete a reward
export const deleteReward = async ({ rewardId }: { rewardId: number }) => {
  try {
    const { data, error } = await supabase
      .from("reward")
      .delete()
      .eq("id", rewardId)
      .select("*")

    if (error) {
      console.error("Error deleting reward:", error.message)
      return null
    }

    return data
  } catch (error) {
    console.error("Error deleting reward:", (error as Error).message)
    return null
  }
}

// Get reward redemption history
export const getRewardHistory = async ({ rewardId }: { rewardId: number }) => {
  try {
    const { data, error } = await supabase
      .from("member_reward")
      .select(
        `
        *,
        member:members(*)
      `
      )
      .eq("reward_id", rewardId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reward history:", error.message)
      return []
    }

    return data
  } catch (error) {
    console.error("Error fetching reward history:", (error as Error).message)
    return []
  }
}
