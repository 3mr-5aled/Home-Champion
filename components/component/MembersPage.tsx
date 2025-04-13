"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Loading } from "@/components/ui/loading"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { LuArrowLeft, LuPencil, LuTrash } from "react-icons/lu"
import { toast } from "react-toastify"
// supabase and clerk import
import { useAuth } from "@clerk/nextjs"
import {
  addMember,
  deleteMember,
  getMembers,
  updateMember,
  deductPoints,
  deleteRelatedChore,
  deleteRelatedReward,
  deletePunishment,
} from "@/lib/requests/membersRequests"
import { Member } from "@/common.types"
import DataWrapper from "@/components/ui/DataWrapper"

export default function MembersPage() {
  const { userId, getToken } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loadingMembers, setLoadingMembers] = useState<boolean>(true)

  useEffect(() => {
    if (!userId) return
    const loadMembers = async () => {
      const token = await getToken({ template: "supabase" })
      if (token) {
        const fetchedMembers: Member[] | null = await getMembers({
          userId,
          token,
        })
        setMembers(fetchedMembers ?? []) // Use the fetched members if they exist, otherwise use an empty array
        setLoadingMembers(false)
        console.log(fetchedMembers)
      } else {
        // Handle the case when token is null
        // You can display an error message or take any other appropriate action
        toast.error("Failed to get the token")
      }
    }
    loadMembers()
  }, [userId, getToken])

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isManageOpen, setIsManageOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeductOpen, setIsDeductOpen] = useState(false)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    points: 0,
    pointsDeducted: [],
    chore: [], // Added chore property
    reward: [], // Added reward property
  })
  const [memberEdited, setMemberEdited] = useState<{
    name: string
    role: string
    points: number
    chore: { id: string; name: string; count: number; date: string[] }[]
    reward: { id: string; name: string; count: number; date: string[] }[]
    pointsDeducted: {
      reason: string
      date: string
    }[]
  }>({
    name: "",
    role: "",
    points: 0,
    chore: [],
    reward: [],
    pointsDeducted: [],
  })
  const [deductedPoints, setDeductedPoints] = useState(0)
  const [deductReason, setDeductReason] = useState("")

  // format data into Month dd yyyy
  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // add member handler
  interface NewMember {
    name: string
    role: string
    points: number
    chore: any[]
    reward: any[]
    pointsDeducted: any[]
  }

  interface AddMemberParams {
    userId: string | null
    token: string
    newMember: NewMember
  }

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const token = await getToken({ template: "supabase" })
      if (!token) {
        toast.error("Failed to get the token.")
        return
      }

      if (!userId) {
        toast.error("User ID is not available.")
        return
      }

      const result = await addMember({ userId, token, newMember })
      if (!result) {
        toast.error("Failed to add member.")
        return
      }
      if (!userId) {
        toast.error("User ID is not available.")
        return
      }
      const updatedMembers = await getMembers({
        userId: userId as string,
        token,
      })
      setMembers(updatedMembers || [])
      setNewMember({
        name: "",
        role: "",
        points: 0,
        chore: [],
        reward: [],
        pointsDeducted: [],
      })
      setIsAddOpen(false)
      toast.success("Member added successfully!")
    } catch (error) {
      console.error("Error adding member:", error)
      toast.error("An error occurred while adding the member.")
    }
  }

  // delete member handler
  const handleDeleteMember = async (memberToDelete: Member) => {
    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }

    const result = await deleteMember({
      token,
      memberToDelete: { id: memberToDelete.id.toString() },
    })
    if (!result) {
      toast.error("Failed to add member.")
      return
    }

    if (!userId) {
      toast.error("User ID is not available.")
      return
    }

    const updatedMembers = await getMembers({ userId: userId as string, token })
    setMembers(updatedMembers || [])
    // setMembers(members.filter((member) => member.name !== memberToDelete.name))
    toast.success("Member deleted successfully!")
  }

  // edit member handler
  interface EditMemberParams {
    token: string
    memberEdited: {
      name: string
      role: string
      points: number
      chore: any[]
      reward: any[]
      pointsDeducted: any[]
    }
  }

  const handleEditMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }

    const result = await updateMember({
      token,
      memberEdited: {
        ...memberEdited,
        id: selectedMember?.id ? String(selectedMember.id) : "",
      },
    })
    if (!result) {
      toast.error("Failed to edit member.")
      return
    }

    const updatedMembers = await getMembers({ userId: userId ?? "", token })
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

  interface DeductPointsParams {
    token: string
    memberData: Member | null
    pointsToDeduct: number
    reason: string
  }

  const handleDeductPoints = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }

    if (!selectedMember) {
      toast.error("No member selected.")
      return
    }

    const updatedMember = await deductPoints({
      token,
      memberData: selectedMember,
      pointsToDeduct: deductedPoints,
      reason: deductReason,
    })

    if (updatedMember) {
      const updatedMembers = await getMembers({ userId: userId ?? "", token })
      setMembers(updatedMembers || [])
      setDeductReason("")
      setDeductedPoints(0)
      setIsDeductOpen(false)
      toast.success("Points deducted successfully!")
    } else {
      toast.error("Failed to deduct points")
    }
  }

  // const handleDeleteChore = (member, choreIndex) => {
  //   const updatedMembers = members.map((m) => {
  //     if (m.name === member.name) {
  //       const updatedChores = m.chore.filter((_, index) => index !== choreIndex)
  //       return { ...m, chore: updatedChores }
  //     }
  //     return m
  //   })
  //   setMembers(updatedMembers)
  //   if (selectedMember?.name === member.name) {
  //     setSelectedMember((prev) => ({
  //       ...prev,
  //       chore: updatedMembers.find((m) => m.name === member.name)?.chore || [],
  //     }))
  //   }
  //   toast.success("Chore deleted successfully!")
  // }

  // const handleDeleteReward = (member, rewardIndex) => {
  //   const updatedMembers = members.map((m) => {
  //     if (m.name === member.name) {
  //       const updatedRewards = m.reward.filter(
  //         (_, index) => index !== rewardIndex
  //       )
  //       return { ...m, reward: updatedRewards }
  //     }
  //     return m
  //   })
  //   setMembers(updatedMembers)
  //   if (selectedMember?.name === member.name) {
  //     setSelectedMember((prev) => ({
  //       ...prev,
  //       reward:
  //         updatedMembers.find((m) => m.name === member.name)?.reward || [],
  //     }))
  //   }
  //   toast.success("Reward deleted successfully!")
  // }

  // const handleDeleteDeduction = (member, deductionIndex) => {
  //   const updatedMembers = members.map((m) => {
  //     if (m.name === member.name) {
  //       const updatedDeductions = m.pointsDeducted.filter(
  //         (_, index) => index !== deductionIndex
  //       )
  //       return { ...m, pointsDeducted: updatedDeductions }
  //     }
  //     return m
  //   })
  //   setMembers(updatedMembers)
  //   if (selectedMember?.name === member.name) {
  //     setSelectedMember((prev) => ({
  //       ...prev,
  //       pointsDeducted:
  //         updatedMembers.find((m) => m.name === member.name)?.pointsDeducted ||
  //         [],
  //     }))
  //   }
  //   toast.success("Deduction deleted successfully!")
  // }
  interface UpdateSelectedMemberParams {
    members: Member[]
    memberId: string
  }

  const updateSelectedMember = (
    members: UpdateSelectedMemberParams["members"],
    memberId: UpdateSelectedMemberParams["memberId"]
  ) => {
    const updatedMember = members.find((m) => m.id === Number(memberId))
    setSelectedMember(updatedMember || null)
  }
  interface DeleteChoreParams {
    token: string
    memberId: string
    choreId: string
  }

  interface MemberWithChores {
    id: string
    chore: { id: string }[]
  }

  const handleDeleteChore = async (
    member: MemberWithChores,
    choreIndex: number
  ) => {
    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }

    const choreId = member.chore[choreIndex].id
    const result = await deleteRelatedChore({
      token,
      memberId: member.id,
      choreId,
    })

    if (result) {
      const updatedMembers = await getMembers({ userId: userId ?? "", token })
      setMembers(updatedMembers || [])
      updateSelectedMember(updatedMembers, String(member.id))
      toast.success("Chore deleted successfully!")
    } else {
      toast.error("Failed to delete chore.")
    }
  }

  interface DeleteRewardParams {
    token: string
    memberId: string
    rewardId: string
  }

  interface MemberWithRewards {
    id: string
    reward: { id: string }[]
  }

  const handleDeleteReward = async (
    member: MemberWithRewards,
    rewardIndex: number
  ) => {
    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }

    const rewardId = member.reward[rewardIndex].id
    const result = await deleteRelatedReward({
      token,
      memberId: member.id,
      rewardId,
    })

    if (result) {
      const updatedMembers = await getMembers({ userId: userId ?? "", token })
      setMembers(updatedMembers || [])
      updateSelectedMember(updatedMembers, String(member.id))
      toast.success("Reward deleted successfully!")
    } else {
      toast.error("Failed to delete reward.")
    }
  }

  interface DeletePunishmentParams {
    token: string
    member: Member
    punishmentIndex: number
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
    } as DeletePunishmentParams)

    if (result) {
      const updatedMembers = await getMembers({ userId: userId ?? "", token })
      setMembers(updatedMembers || [])
      updateSelectedMember(updatedMembers, String(member.id))
      toast.success("Deduction deleted successfully!")
    } else {
      toast.error("Failed to delete deduction.")
    }
  }
  return (
    <div className="container mx-auto min-h-screen px-4 py-12 md:py-16 lg:py-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-row">
          <Link
            href="/"
            className="bg-base-200 rounded-full border-2 w-fit h-fit border-white text-white p-3 mx-3 font-bold"
            prefetch={false}
          >
            <LuArrowLeft />
          </Link>
          <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
            Members Page
          </h1>
        </div>
        <div>
          <button
            className="btn btn-primary custom-btn"
            onClick={() => setIsAddOpen(true)}
          >
            Add Member
          </button>
          <button
            className="btn btn-secondary custom-btn ml-2"
            onClick={() => setIsManageOpen(true)}
            title="Manage Members"
          >
            Manage Members
          </button>
        </div>
      </div>
      <DataWrapper data={members} noDataMessage="No members exist">
        {(members) => (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member: Member) => (
                <Card key={member.name}>
                  <CardHeader className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary">
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-lg font-semibold">{member.name}</div>
                      <div className=" text-gray-400 capitalize">
                        {member.role}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-2xl font-bold">{member.points}</div>
                      <span className="badge badge-secondary px-2">Points</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>Chores Completed</div>
                        <div className="font-semibold">
                          {member.chore ? member.chore.length : "0"}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>Rewards Earned</div>
                        <div className="font-semibold">
                          {member.reward ? member.reward.length : "0"}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>Number of Punishments</div>
                        <div className="font-semibold">
                          {member.pointsDeducted
                            ? member.pointsDeducted.length
                            : "0"}
                        </div>
                      </div>

                      <button
                        className="w-full btn btn-outline"
                        onClick={() => {
                          setSelectedMember(member)
                          setIsViewDetailsOpen(true)
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DataWrapper>
      {/* Add Member Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAddMember}>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Fill out the member&#39;s information below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right col-span-1">
                  Name
                </Label>
                <Input
                  id="name"
                  required
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="relationship" className="text-right col-span-1">
                  Relationship
                </Label>
                {/* @ts-ignore */}
                <select
                  id="relationship-select"
                  className=" col-span-3 select select-bordered w-full max-w-xs"
                  value={newMember.role}
                  defaultValue="RelationShip"
                  required
                  onChange={(e) =>
                    setNewMember({ ...newMember, role: e.target.value })
                  }
                >
                  <option disabled>RelationShip</option>
                  <option value="son">Son</option>
                  <option value="daughter">Daughter</option>
                  <option value="parent">Parent</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <button type="submit" className="btn btn-primary custom-btn">
                Add Member
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Manage Members Modal */}
      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Members</DialogTitle>
            <DialogDescription>
              Edit or delete members from the list below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <DataWrapper data={members} noDataMessage="No members exist">
              {(members) =>
                members.map((member: Member) => (
                  <div
                    key={member.name}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold">{member.name}</div>
                      <div className="text-gray-400">{member.role}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => {
                          setSelectedMember(member)
                          setIsDeductOpen(true)
                        }}
                      >
                        Deduct Points
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setMemberEdited({
                            name: member.name,
                            role: member.role || "",
                            points: member.points,
                            chore:
                              member.chore?.map((chore) => ({
                                ...chore,
                                id: chore.id?.toString() || "",
                              })) || [],
                            reward:
                              member.reward?.map((reward) => ({
                                ...reward,
                                id: reward.id.toString(),
                              })) || [],
                            pointsDeducted: member.pointsDeducted || [],
                          })
                          setIsEditOpen(true)
                        }}
                        title="Edit Member"
                      >
                        <LuPencil aria-label="Edit Member" />
                      </button>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => handleDeleteMember(member)}
                        title="Delete Member"
                      >
                        <LuTrash aria-label="Delete Member" />
                      </button>
                    </div>
                  </div>
                ))
              }
            </DataWrapper>
          </div>
        </DialogContent>
      </Dialog>
      {/* Edit Member Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEditMember}>
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
              <DialogDescription>
                Update the member&#39;s information below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={memberEdited.name}
                  onChange={(e) =>
                    setMemberEdited({ ...memberEdited, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="relationship" className="text-right col-span-1">
                  Relationship
                </Label>
                {/* @ts-ignore */}
                <select
                  className=" col-span-3 select select-bordered w-full max-w-xs"
                  value={memberEdited.role}
                  defaultValue="RelationShip"
                  required
                  onChange={(e) =>
                    setMemberEdited({ ...memberEdited, role: e.target.value })
                  }
                >
                  <option disabled value="RelationShip">
                    RelationShip
                  </option>
                  <option value="son">Son</option>
                  <option value="daughter">Daughter</option>
                  <option value="parent">Parent</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <button className="btn btn-primary" type="submit">
                Save Changes
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Deduct Points Modal */}
      <Dialog open={isDeductOpen} onOpenChange={setIsDeductOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleDeductPoints}>
            <DialogHeader>
              <DialogTitle>
                Deduct Points from {selectedMember?.name}
              </DialogTitle>
              <DialogDescription>
                Specify the reason and amount of points to deduct.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">
                  Reason
                </Label>
                <Input
                  id="reason"
                  value={deductReason}
                  onChange={(e) => setDeductReason(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="points" className="text-right">
                  Points
                </Label>
                <Input
                  id="points"
                  type="number"
                  min={1}
                  value={deductedPoints}
                  onChange={(e) => setDeductedPoints(parseInt(e.target.value))}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <button className="btn btn-primary" type="submit">
                Deduct Points
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* View Details Modal */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedMember?.name}&#39;s Details</DialogTitle>
            <DialogDescription>
              View and manage completed chores, earned rewards, and deducted
              points.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <h3 className="font-semibold text-lg">Completed Chores</h3>
            {selectedMember?.chore && selectedMember.chore.length > 0 ? (
              selectedMember?.chore?.map((chore, index) => (
                <div
                  key={index}
                  className="collapse collapse-arrow bg-base-300"
                >
                  <label>
                    <input
                      type="checkbox"
                      name="my-accordion-2"
                      id="accordion-toggle"
                    />
                    <label htmlFor="accordion-toggle" className="sr-only">
                      Toggle Accordion
                    </label>
                    Toggle Details
                  </label>
                  <div className="collapse-title text-xl font-medium">
                    <div className="font-semibold">
                      {chore.name}{" "}
                      <span className="badge badge-primary badge-md">
                        {chore.count}
                      </span>
                    </div>
                  </div>
                  <div className="collapse-content px-7 flex flex-row justify-between items-center">
                    <ol className="list-decimal">
                      {chore.date.map((date) => (
                        <li key={date}>{formatDate(date)}</li>
                      ))}
                    </ol>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() =>
                        selectedMember &&
                        handleDeleteChore(
                          {
                            ...selectedMember,
                            id: selectedMember.id.toString(),
                            chore:
                              selectedMember.chore?.map((chore) => ({
                                id: chore.id ? chore.id.toString() : "",
                                name: chore.name,
                                count: chore.count,
                                date: chore.date,
                              })) ?? [],
                          },
                          index
                        )
                      }
                      title="Delete Chore"
                    >
                      Delete chore
                      <LuTrash />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                No completed chores available.
              </div>
            )}

            <h3 className="font-semibold text-lg">Earned Rewards</h3>
            {selectedMember?.reward?.length ?? 0 > 0 ? (
              selectedMember?.reward?.map((reward, index) => (
                <div
                  key={index}
                  className="collapse collapse-arrow bg-base-300"
                >
                  <label>
                    <input
                      type="checkbox"
                      name="my-accordion-2"
                      id="accordion-toggle"
                    />
                    <label htmlFor="accordion-toggle" className="sr-only">
                      Toggle Accordion
                    </label>
                  </label>
                  <div className="collapse-title text-xl font-medium">
                    <div className="font-semibold">
                      {reward.name}{" "}
                      <span className="badge badge-primary badge-md">
                        {reward.count}
                      </span>
                    </div>
                  </div>
                  <div className="collapse-content px-7 flex flex-row justify-between items-center">
                    <ol className="list-decimal">
                      {reward.date.map((date) => (
                        <li key={date}>{formatDate(date)}</li>
                      ))}
                    </ol>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() =>
                        selectedMember &&
                        handleDeleteReward(
                          {
                            ...selectedMember,
                            id: selectedMember.id.toString(),
                            reward:
                              selectedMember.reward?.map((r) => ({
                                id: r.id.toString(),
                              })) || [],
                          },
                          index
                        )
                      }
                    >
                      Delete reward
                      <LuTrash />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                No earned rewards available.
              </div>
            )}

            <h3 className="font-semibold text-lg">Points Deductions</h3>
            {selectedMember?.pointsDeducted?.length ? (
              selectedMember?.pointsDeducted?.map((deduction, index) => (
                <div
                  key={index}
                  className="collapse collapse-arrow bg-base-300"
                >
                  <input
                    type="checkbox"
                    id="accordion-toggle"
                    name="my-accordion-2"
                  />
                  <label htmlFor="accordion-toggle" className="sr-only">
                    Toggle Accordion
                  </label>
                  <div className="collapse-title text-xl font-medium">
                    <div className="font-semibold">{deduction.reason}</div>
                  </div>
                  <div className="collapse-content px-7 flex flex-row justify-between items-center">
                    {formatDate(deduction.date)}
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() =>
                        selectedMember &&
                        handleDeleteDeduction(selectedMember, index)
                      }
                    >
                      <LuTrash />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                No points deductions available.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
