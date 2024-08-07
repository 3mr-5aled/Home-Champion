"use client"
import { useState, useEffect } from "react"
import {
  AddMemberModal,
  ManageMembersModal,
  EditMemberModal,
  DeductPointsModal,
  ViewDetailsModal,
  MemberCard,
} from "@/components/pages/members"
import Header from "@/components/ui/Header"
import { useAuth } from "@clerk/nextjs"
import {
  addMember,
  deductPoints,
  deleteMember,
  deletePunishment,
  deleteRelatedChore,
  deleteRelatedReward,
  getMembers,
  updateMember,
} from "@/lib/requests"
import { toast } from "react-toastify"
import { Member } from "@/common.types"

const MembersPage = () => {
  const { userId, getToken } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isManageOpen, setIsManageOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeductOpen, setIsDeductOpen] = useState(false)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    points: 0,
    pointsDeducted: [],
  })
  const [memberEdited, setMemberEdited] = useState({
    name: "",
    role: "",
    points: 0,
    chore: [],
    reward: [],
    pointsDeducted: [],
  })
  const [deductionDetails, setDeductionDetails] = useState({
    reason: "",
    amount: 0,
  })

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      const token = await getToken({ template: "supabase" })
      if (token) {
        const fetchedMembers: Member[] | null = await getMembers({
          userId,
          token,
        })
        setMembers(fetchedMembers || [])
        console.log("Fetched Members:", fetchedMembers)
      } else {
        toast.error("Failed to get the token")
      }
    }

    if (userId) {
      fetchMembers()
    }
  }, [userId, getToken])

  const handleAddMember = async (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault()
    try {
      const token = await getToken({ template: "supabase" })
      if (!token) {
        toast.error("Failed to get the token.")
        return
      }
      const result = await addMember({ userId, token, newMember })
      if (!result) {
        toast.error("Failed to add member.")
        return
      }
      const updatedMembers: Member[] = await getMembers({ userId, token })
      setMembers(updatedMembers)
      setNewMember({ name: "", role: "", points: 0, pointsDeducted: [] })
      setIsAddOpen(false)
      toast.success("Member added successfully!")
    } catch (error) {
      console.error("Error adding member:", error)
      toast.error("An error occurred while adding the member.")
    }
  }

  const handleEditMember = async (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault()
    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }
    const result = await updateMember({ token, memberEdited })
    if (!result) {
      toast.error("Failed to edit member.")
      return
    }
    const updatedMembers = await getMembers({ userId, token })
    setMembers(updatedMembers || [])
    setMemberEdited({
      name: "",
      role: "",
      points: 0,
      chore: [],
      reward: [],
      pointsDeducted: [],
    })
    setIsEditOpen(false)
    setIsManageOpen(false)
    toast.success("Member edited successfully!")
  }

  const handleDeleteMember = async (memberToDelete: Member) => {
    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }
    const result = await deleteMember({ token, memberToDelete })
    if (!result) {
      toast.error("Failed to add member.")
      return
    }
    const updatedMembers = await getMembers({ userId, token })
    setMembers(updatedMembers || [])
    toast.success("Member deleted successfully!")
  }

  const handleDeductPoints = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedMember) {
      toast.error("No member selected for point deduction.")
      return
    }
    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }
    const updatedMember = await deductPoints({
      token,
      memberData: selectedMember,
      pointsToDeduct: deductionDetails.amount,
      reason: deductionDetails.reason,
    })
    if (updatedMember) {
      const updatedMembers = await getMembers({ userId, token })
      setMembers(updatedMembers || [])
      updateSelectedMember(updatedMembers, selectedMember.id)
      setDeductionDetails({ reason: "", amount: 0 })
      setIsDeductOpen(false)
      toast.success("Points deducted successfully!")
    } else {
      toast.error("Failed to deduct points")
    }
  }

  const updateSelectedMember = (members: Member[], memberId: number) => {
    const updatedMember: Member | undefined = members.find(
      (m) => m.id === memberId
    )
    setSelectedMember(updatedMember ?? null)
  }

  const handleDeleteChore = async (member: Member, choreIndex: number) => {
    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }
    if (!member) {
      toast.error("Failed to get the member.")
      return
    }
    const choreId = member.chore?.[choreIndex]?.id
    const result = await deleteRelatedChore({
      token,
      memberId: member.id,
      choreId,
    })
    if (result) {
      const updatedMembers: Member[] = await getMembers({ userId, token })
      setMembers(updatedMembers || [])
      updateSelectedMember(updatedMembers, member.id)
      toast.success("Chore deleted successfully!")
    } else {
      toast.error("Failed to delete chore.")
    }
  }

  const handleDeleteReward = async (member: Member, rewardIndex: number) => {
    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }
    const rewardId = member.reward?.[rewardIndex]?.id
    const result = await deleteRelatedReward({
      token,
      memberId: member.id,
      rewardId,
    })
    if (result) {
      const updatedMembers = await getMembers({ userId, token })
      setMembers(updatedMembers || [])
      updateSelectedMember(updatedMembers, member.id)
      toast.success("Reward deleted successfully!")
    } else {
      toast.error("Failed to delete reward.")
    }
  }

  const handleDeleteDeduction = async (
    member: Member,
    deductionIndex: number
  ) => {
    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }
    const result = await deletePunishment({
      token,
      member,
      punishmentIndex: deductionIndex,
    })
    if (result) {
      const updatedMembers = await getMembers({ userId, token })
      setMembers(updatedMembers || [])
      updateSelectedMember(updatedMembers, member.id)
      toast.success("Deduction deleted successfully!")
    } else {
      toast.error("Failed to delete deduction.")
    }
  }

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member)
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
      />

      <ManageMembersModal
        isManageOpen={isManageOpen}
        setIsManageOpen={setIsManageOpen}
        members={members}
        setSelectedMember={setSelectedMember}
        setIsDeductOpen={setIsDeductOpen}
        setIsEditOpen={setIsEditOpen}
        setMemberEdited={setMemberEdited}
        handleDeleteMember={handleDeleteMember}
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
