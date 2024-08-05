import { supabaseClient } from "../supabaseClient"

export async function getRewards({
  userId,
  token,
}: {
  userId: string
  token: string
}) {
  const supabase = await supabaseClient(token)

  // Fetch rewards with related member_reward and members data
  const { data: rewards, error } = await supabase
    .from("reward")
    .select(
      `
      *,
      member_reward (
        date,
        count,
        member_id,
        reward_id
      ),
      members!member_reward(id,name,points)
    `
    )
    .eq("user_id", userId)
    .eq("status", "active")

  if (error) {
    console.error("Error fetching rewards:", error)
    return []
  }

  // Merge member_reward data into members object
  rewards.forEach((reward) => {
    reward.members = reward.members.map((member) => {
      const memberReward = reward.member_reward.find(
        (mr) => mr.member_id === member.id
      )
      return memberReward
        ? { ...member, count: memberReward.count, date: memberReward.date }
        : member
    })
  })

  // Log and return the rewards
  console.log(rewards)
  return rewards
}

// add a reward
export const addReward = async ({ userId, token, newReward }) => {
  const supabase = await supabaseClient(token)
  try {
    // Perform the insertion
    const { data, error } = await supabase
      .from("reward") // Replace 'rewards' with your actual table name
      .insert([{ user_id: userId, ...newReward }])
      .select("*") // Ensure single is used if inserting one record

    // Check if there's an error
    if (error) {
      console.error("Error adding reward:", error.message)
      return null
    }

    // Return the inserted data
    return data
  } catch (error) {
    console.error("Error adding reward:", error.message)
    return null
  }
}

// update a reward
export const updateReward = async ({ token, rewardEdited }) => {
  const supabase = await supabaseClient(token)
  try {
    const { data, error } = await supabase
      .from("reward")
      .update({
        // Add the fields you want to update here
        name: rewardEdited.name,
        points: rewardEdited.points,
        description: rewardEdited.description,
      })
      .eq("id", rewardEdited.id)
      .select("*")

    // Check if there's an error
    if (error) {
      console.error("Error updating reward:", error.message)
      return null
    }

    // Return the updated data
    return data
  } catch (error) {
    console.error("Error updating reward:", error.message)
    return null
  }
}

// ! Delete a reward
export const deleteReward = async ({ token, rewardToDelete }) => {
  const supabase = await supabaseClient(token)
  const response = await supabase
    .from("reward")
    .update({ status: "removed" })
    .eq("id", rewardToDelete.id)
  return response
}

// TODO delete forever and delete any related data
// export const deleteChore = async ({ token, rewardToDelete }) => {
//   const supabase = await supabaseClient(token)
//   const response = await supabase
//     .from("reward")
//     .delete()
//     .eq("id", rewardToDelete.id)
//   return response
// }

// Redeem a reward
export const redeemReward = async ({ token, reward, member }) => {
  const supabase = await supabaseClient(token)
  try {
    // Decrement member's points
    const updatedMember = {
      ...member,
      points: member.points - reward.points,
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

    // Check if the member has already redeemed this reward
    const { data: existingMemberReward, error: fetchError } = await supabase
      .from("member_reward")
      .select("*")
      .eq("member_id", member.id)
      .eq("reward_id", reward.id)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error(
        "Error fetching existing member reward:",
        fetchError.message
      )
      return null
    }
    console.log("Existing member reward:", existingMemberReward)

    if (existingMemberReward) {
      // Update the existing entry
      const updatedMemberReward = {
        ...existingMemberReward,
        count: existingMemberReward.count + 1,
        date: [...existingMemberReward.date, new Date().toISOString()],
      }

      const { data: memberRewardData, error: memberRewardError } =
        await supabase
          .from("member_reward")
          .update(updatedMemberReward)
          .eq("member_id", member.id)
          .eq("reward_id", reward.id)
          .select("*")

      if (memberRewardError) {
        console.error(
          "Error updating member_reward:",
          memberRewardError.message
        )
        return null
      }
      console.log("Updated member reward:", memberRewardData)

      return { memberData, memberRewardData }
    } else {
      // Insert a new entry into the member_reward table
      const { data: memberRewardData, error: memberRewardError } =
        await supabase
          .from("member_reward")
          .insert([
            {
              member_id: member.id,
              reward_id: reward.id,
              count: 1,
              date: [new Date().toISOString()],
            },
          ])
          .select("*")

      if (memberRewardError) {
        console.error(
          "Error inserting into member_reward:",
          memberRewardError.message
        )
        return null
      }
      console.log("Inserted new member reward:", memberRewardData)

      return { memberData, memberRewardData }
    }
  } catch (error) {
    console.error("Error redeeming reward:", error.message)
    return null
  }
}

// get members for rewards
export async function getMembersRewards({
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
