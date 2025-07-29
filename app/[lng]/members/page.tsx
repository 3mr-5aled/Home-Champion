"use client"

import { useEffect, useState } from "react"
import { toast } from "react-toastify"
// supabase and clerk import
import { useAuth } from "@clerk/nextjs"
import {
  addMember,
  deleteMember,
  getMembers,
  updateMember,
  deductPoints,
  deleteDeduction,
  deleteChoreCompletion,
  deleteRewardRedemption,
  resetMember,
} from "@/lib/requests/membersRequests"
import { Member } from "@/common.types"
import Header from "@/components/ui/Header"
import {
  AddMemberModal,
  DeductPointsModal,
  EditMemberModal,
  ManageMembersModal,
  MemberCard,
  ViewDetailsModal,
} from "@/components/pages/members"

const MembersPage = () => {
  const { userId } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isManageOpen, setIsManageOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeductOpen, setIsDeductOpen] = useState(false)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [newMember, setNewMember] = useState<Member>({
    id: 0,
    name: "",
    role: "",
    points: 0,
    pointsDeducted: [],
  })
  const [memberEdited, setMemberEdited] = useState<Member>({
    id: 0,
    name: "",
    role: "",
    points: 0,
    pointsDeducted: [],
  })
  const [deductionDetails, setDeductionDetails] = useState({
    reason: "",
    amount: 0,
  })

  // Loading states
  const [loadingMembers, setLoadingMembers] = useState<boolean>(true)
  const [addingMember, setAddingMember] = useState<boolean>(false)
  const [editingMember, setEditingMember] = useState<boolean>(false)
  const [deletingMemberId, setDeletingMemberId] = useState<number | null>(null)
  const [deductingPoints, setDeductingPoints] = useState<boolean>(false)
  const [deletingActivity, setDeletingActivity] = useState<boolean>(false)

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      if (userId) {
        setLoadingMembers(true)
        console.log("Fetching members for userId:", userId)
        const fetchedMembers: Member[] | null = await getMembers({
          userId,
        })
        setMembers(fetchedMembers || [])
        console.log("Fetched Members:", fetchedMembers)
        setLoadingMembers(false)
      }
    }

    if (userId) {
      fetchMembers()
    }
  }, [userId])

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAddingMember(true)
    try {
      if (!userId) {
        toast.error("User ID is missing.")
        return
      }
      console.log("Adding member:", newMember, "for userId:", userId)
      const result = await addMember({ userId, newMember })
      if (!result) {
        toast.error("Failed to add member.")
        return
      }

      const updatedMembers: Member[] | null = await getMembers({ userId })
      setMembers(updatedMembers || [])
      setNewMember({ id: 0, name: "", role: "", points: 0, pointsDeducted: [] })
      setIsAddOpen(false)
      toast.success("Member added successfully!")
    } catch (error) {
      console.error("Error adding member:", error)
      toast.error("An error occurred while adding the member.")
    } finally {
      setAddingMember(false)
    }
  }

  const handleEditMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEditingMember(true)
    try {
      if (!userId) {
        toast.error("User ID is missing.")
        return
      }
      console.log("Editing member:", memberEdited)
      const result = await updateMember({
        memberEdited: {
          ...memberEdited,
          role: memberEdited.role || "Member",
        },
      })
      if (!result) {
        toast.error("Failed to edit member.")
        return
      }

      const updatedMembers = await getMembers({ userId })
      setMembers(updatedMembers || [])
      setMemberEdited({
        id: 0,
        name: "",
        role: "",
        points: 0,
        pointsDeducted: [],
      })
      setIsEditOpen(false)
      setIsManageOpen(false)
      toast.success("Member edited successfully!")
    } catch (error) {
      console.error("Error editing member:", error)
      toast.error("An error occurred while editing the member.")
    } finally {
      setEditingMember(false)
    }
  }

  const handleDeleteMember = async (memberToDelete: Member) => {
    setDeletingMemberId(memberToDelete.id)
    try {
      if (!userId) {
        toast.error("User ID is missing.")
        return
      }
      console.log("Deleting member:", memberToDelete.id)
      const result = await deleteMember({
        memberId: memberToDelete.id,
      })
      if (!result) {
        toast.error("Failed to delete member.")
        return
      }
      const updatedMembers = await getMembers({ userId })
      setMembers(updatedMembers || [])
      toast.success("Member deleted successfully!")
    } catch (error) {
      console.error("Error deleting member:", error)
      toast.error("An error occurred while deleting the member.")
    } finally {
      setDeletingMemberId(null)
    }
  }

  const handleResetMember = async (memberToReset: Member) => {
    const confirmMessage = `Are you sure you want to reset ${memberToReset.name}?\n\nThis will:\n• Reset their points to 0\n• Delete all chore completion history\n• Delete all reward redemption history\n• Delete all point deduction history\n\nThis action cannot be undone.`

    if (!window.confirm(confirmMessage)) {
      return
    }

    setDeletingMemberId(memberToReset.id) // Reuse existing loading state
    try {
      if (!userId) {
        toast.error("User ID is missing.")
        return
      }
      console.log("Resetting member:", memberToReset.id)
      const result = await resetMember({
        memberId: memberToReset.id,
      })
      if (!result) {
        toast.error("Failed to reset member.")
        return
      }
      const updatedMembers = await getMembers({ userId })
      setMembers(updatedMembers || [])
      toast.success(`${memberToReset.name} has been reset successfully!`)
    } catch (error) {
      console.error("Error resetting member:", error)
      toast.error("An error occurred while resetting the member.")
    } finally {
      setDeletingMemberId(null)
    }
  }

  const handleDeductPoints = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setDeductingPoints(true)
    try {
      if (!selectedMember) {
        toast.error("No member selected for point deduction.")
        return
      }
      if (!userId) {
        toast.error("User ID is missing.")
        return
      }
      console.log(
        "Deducting points for member:",
        selectedMember.id,
        "amount:",
        deductionDetails.amount
      )
      const updatedMember = await deductPoints({
        memberId: selectedMember.id,
        points: deductionDetails.amount,
        reason: deductionDetails.reason,
      })
      if (updatedMember) {
        const updatedMembers = await getMembers({ userId })
        setMembers(updatedMembers || [])
        updateSelectedMember(updatedMembers || [], selectedMember.id)
        setDeductionDetails({ reason: "", amount: 0 })
        setIsDeductOpen(false)
        toast.success("Points deducted successfully!")
      } else {
        toast.error("Failed to deduct points")
      }
    } catch (error) {
      console.error("Error deducting points:", error)
      toast.error("An error occurred while deducting points.")
    } finally {
      setDeductingPoints(false)
    }
  }

  const updateSelectedMember = (members: Member[], memberId: number) => {
    const updatedMember: Member | undefined = members.find(
      (m) => m.id === memberId
    )
    setSelectedMember(updatedMember ?? null)
  }

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member)
  }

  // Functions for chore/reward/deduction deletion
  const handleDeleteChore = async (member: Member, choreIndex: number) => {
    setDeletingActivity(true)
    try {
      if (!userId) {
        toast.error("User ID is missing.")
        return
      }

      if (!member.chore || choreIndex >= member.chore.length) {
        toast.error("Invalid chore selected.")
        return
      }

      const chore = member.chore[choreIndex]

      // Confirm deletion
      if (
        window.confirm(
          `Are you sure you want to delete all completions of "${
            chore.name
          }" for ${member.name}? This will deduct ${
            chore.points * chore.count
          } points.`
        )
      ) {
        const result = await deleteChoreCompletion({
          memberId: member.id,
          choreId: chore.id!,
        })

        if (result) {
          // Refresh the members list
          const updatedMembers = await getMembers({ userId })
          setMembers(updatedMembers || [])
          updateSelectedMember(updatedMembers || [], member.id)
          toast.success(
            `Chore completions deleted and ${
              chore.points * chore.count
            } points deducted from ${member.name}!`
          )
        } else {
          toast.error("Failed to delete chore completions.")
        }
      }
    } catch (error) {
      console.error("Error deleting chore:", error)
      toast.error("An error occurred while deleting the chore.")
    } finally {
      setDeletingActivity(false)
    }
  }

  const handleDeleteReward = async (member: Member, rewardIndex: number) => {
    setDeletingActivity(true)
    try {
      if (!userId) {
        toast.error("User ID is missing.")
        return
      }

      if (!member.reward || rewardIndex >= member.reward.length) {
        toast.error("Invalid reward selected.")
        return
      }

      const reward = member.reward[rewardIndex]

      // Confirm deletion
      if (
        window.confirm(
          `Are you sure you want to delete all redemptions of "${
            reward.name
          }" for ${member.name}? This will restore ${
            reward.points * reward.count
          } points.`
        )
      ) {
        const result = await deleteRewardRedemption({
          memberId: member.id,
          rewardId: reward.id,
        })

        if (result) {
          // Refresh the members list
          const updatedMembers = await getMembers({ userId })
          setMembers(updatedMembers || [])
          updateSelectedMember(updatedMembers || [], member.id)
          toast.success(
            `Reward redemptions deleted and ${
              reward.points * reward.count
            } points restored to ${member.name}!`
          )
        } else {
          toast.error("Failed to delete reward redemptions.")
        }
      }
    } catch (error) {
      console.error("Error deleting reward:", error)
      toast.error("An error occurred while deleting the reward.")
    } finally {
      setDeletingActivity(false)
    }
  }

  const handleDeleteDeduction = async (
    member: Member,
    deductionIndex: number
  ) => {
    setDeletingActivity(true)
    try {
      if (!userId) {
        toast.error("User ID is missing.")
        return
      }

      if (
        !member.pointsDeducted ||
        deductionIndex >= member.pointsDeducted.length
      ) {
        toast.error("Invalid deduction selected.")
        return
      }

      const deduction = member.pointsDeducted[deductionIndex]

      // Confirm deletion
      if (
        window.confirm(
          `Are you sure you want to delete this deduction and restore ${deduction.points} points to ${member.name}?`
        )
      ) {
        const result = await deleteDeduction({
          deductionId: deduction.id,
          memberId: member.id,
        })

        if (result) {
          // Refresh the members list
          const updatedMembers = await getMembers({ userId })
          setMembers(updatedMembers || [])
          updateSelectedMember(updatedMembers || [], member.id)
          toast.success(
            `Deduction deleted and ${deduction.points} points restored to ${member.name}!`
          )
        } else {
          toast.error("Failed to delete deduction.")
        }
      }
    } catch (error) {
      console.error("Error deleting deduction:", error)
      toast.error("An error occurred while deleting the deduction.")
    } finally {
      setDeletingActivity(false)
    }
  }

  return (
    <div className="container mx-auto min-h-screen px-4 py-12 md:py-16 lg:py-20">
      <Header title="Members" description="View Family Members here">
        <button
          className="btn btn-primary custom-btn"
          onClick={() => setIsAddOpen(true)}
        >
          Add Member
        </button>
        <button
          className="btn btn-secondary custom-btn ml-2"
          onClick={() => setIsManageOpen(true)}
        >
          Manage Members
        </button>
        <button
          className="btn btn-accent custom-btn ml-2"
          onClick={() => setIsDeductOpen(true)}
        >
          Deduct Points
        </button>
      </Header>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              setSelectedMember={handleSelectMember}
              setIsViewDetailsOpen={setIsViewDetailsOpen}
            />
          ))}
        </div>
      </div>

      <AddMemberModal
        isAddOpen={isAddOpen}
        setIsAddOpen={setIsAddOpen}
        newMember={newMember}
        setNewMember={setNewMember}
        handleAddMember={handleAddMember}
        isLoading={addingMember}
      />

      <ManageMembersModal
        isManageOpen={isManageOpen}
        setIsManageOpen={setIsManageOpen}
        members={members}
        setIsEditOpen={setIsEditOpen}
        setMemberEdited={setMemberEdited}
        handleDeleteMember={handleDeleteMember}
        handleResetMember={handleResetMember}
      />

      <EditMemberModal
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        memberEdited={memberEdited}
        setMemberEdited={setMemberEdited}
        handleEditMember={handleEditMember}
      />

      <DeductPointsModal
        isDeductOpen={isDeductOpen}
        setIsDeductOpen={setIsDeductOpen}
        deductionDetails={deductionDetails}
        setDeductionDetails={setDeductionDetails}
        handleDeductPoints={handleDeductPoints}
        members={members}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
      />

      <ViewDetailsModal
        isViewDetailsOpen={isViewDetailsOpen}
        setIsViewDetailsOpen={setIsViewDetailsOpen}
        selectedMember={selectedMember}
        handleDeleteChore={handleDeleteChore}
        handleDeleteReward={handleDeleteReward}
        handleDeleteDeduction={handleDeleteDeduction}
      />
    </div>
  )
}

export default MembersPage
