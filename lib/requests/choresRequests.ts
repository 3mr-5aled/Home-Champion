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
    chore.members = chore.members.map((member) => {
      const memberChore = chore.member_chore.find(
        (mc) => mc.member_id === member.id
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
export const addChore = async ({ userId, token, newChore }) => {
  const supabase = await supabaseClient(token)
  try {
    // Perform the insertion
    const { data, error } = await supabase
      .from("chore") // Replace 'chores' with your actual table name
      .insert([{ user_id: userId, ...newChore }])
      .select("*") // Ensure single is used if inserting one record

    // Check if there's an error
    if (error) {
      console.error("Error adding chore:", error.message)
      return null
    }

    // Return the inserted data
    return data
  } catch (error) {
    console.error("Error adding chore:", error.message)
    return null
  }
}

// update a chore
export const updateChore = async ({ token, choreEdited }) => {
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
      console.error("Error updating chore:", error.message)
      return null
    }

    // Return the updated data
    return data
  } catch (error) {
    console.error("Error updating chore:", error.message)
    return null
  }
}

// TODO need work Delete a chore (update status into removed and remove it if it doesn't exsit in the database)
export const deleteChore = async ({ token, choreToDelete }) => {
  const supabase = await supabaseClient(token)
  const response = await supabase
    .from("chore")
    .update({ status: "removed" })
    .eq("id", choreToDelete.id)
  return response
}
export const getDeletedChore = async ({ userId, token }) => {
  const supabase = await supabaseClient(token)
  const response = await supabase
    .from("chore")
    .select("*")
    .eq("status", "removed")
    .eq("user_id", userId)

  return response
}

// TODO delete forever and delete any related data
// export const deleteChore = async ({ token, choreToDelete }) => {
//   const supabase = await supabaseClient(token)
//   const response = await supabase
//     .from("chore")
//     .delete()
//     .eq("id", choreToDelete.id)
//   return response
// }

// Claim a chore
export const claimChore = async ({ token, chore, member }) => {
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

    if (fetchError && fetchError.code !== "PGRST116") {
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
    console.error("Error claiming chore:", error.message)
    return null
  }
}
