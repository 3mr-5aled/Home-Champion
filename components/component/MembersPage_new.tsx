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
} from "@/lib/requests/membersRequests"
import { Member } from "@/common.types"
import DataWrapper from "@/components/ui/DataWrapper"

export default function MembersPage() {
  const { userId } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loadingMembers, setLoadingMembers] = useState<boolean>(true)

  useEffect(() => {
    if (!userId) return
    const loadMembers = async () => {
      const fetchedMembers: Member[] | null = await getMembers({
        userId,
      })
      setMembers(fetchedMembers ?? [])
      setLoadingMembers(false)
      console.log(fetchedMembers)
    }
    loadMembers()
  }, [userId])

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
  })

  const [memberEdited, setMemberEdited] = useState<{
    id: number
    name: string
    role: string
    points: number
  }>({
    id: 0,
    name: "",
    role: "",
    points: 0,
  })

  const [deductForm, setDeductForm] = useState({
    points: 0,
    reason: "",
  })

  // Add Member Function
  const handleAddMember = async () => {
    if (!userId) {
      toast.error("User not authenticated")
      return
    }

    const result = await addMember({ userId, newMember })
    if (result) {
      // Refresh members list
      const updatedMembers = await getMembers({
        userId: userId as string,
      })
      setMembers(updatedMembers ?? [])
      setIsAddOpen(false)
      setNewMember({ name: "", role: "", points: 0 })
      toast.success("Member added successfully!")
    } else {
      toast.error("Failed to add member")
    }
  }

  // Delete Member Function
  const handleDeleteMember = async (memberId: number) => {
    const result = await deleteMember({
      memberId,
    })
    if (result) {
      // Refresh members list
      const updatedMembers = await getMembers({ userId: userId as string })
      setMembers(updatedMembers ?? [])
      toast.success("Member deleted successfully!")
    } else {
      toast.error("Failed to delete member")
    }
  }

  // Edit Member Function
  const handleEditMember = async () => {
    const result = await updateMember({
      memberEdited: {
        ...memberEdited,
        id: memberEdited.id,
      } as Member,
    })
    if (result) {
      // Refresh members list
      const updatedMembers = await getMembers({ userId: userId ?? "" })
      setMembers(updatedMembers ?? [])
      setIsEditOpen(false)
      toast.success("Member updated successfully!")
    } else {
      toast.error("Failed to update member")
    }
  }

  // Deduct Points Function
  const handleDeductPoints = async () => {
    if (!selectedMember) return

    const result = await deductPoints({
      memberId: selectedMember.id,
      points: deductForm.points,
      reason: deductForm.reason,
    })

    if (result) {
      // Refresh members list
      const updatedMembers = await getMembers({ userId: userId ?? "" })
      setMembers(updatedMembers ?? [])
      setIsDeductOpen(false)
      setDeductForm({ points: 0, reason: "" })
      toast.success("Points deducted successfully!")
    } else {
      toast.error("Failed to deduct points")
    }
  }

  const openEditDialog = (member: Member) => {
    setSelectedMember(member)
    setMemberEdited({
      id: member.id,
      name: member.name,
      role: member.role || "",
      points: member.points,
    })
    setIsEditOpen(true)
  }

  const openViewDetailsDialog = (member: Member) => {
    setSelectedMember(member)
    setIsViewDetailsOpen(true)
  }

  const openDeductDialog = (member: Member) => {
    setSelectedMember(member)
    setIsDeductOpen(true)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
            >
              <LuArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold">Family Members</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Add Member
            </button>
            <button
              onClick={() => setIsManageOpen(true)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Manage
            </button>
          </div>
        </div>

        {/* Members Grid */}
        <DataWrapper
          data={members}
          loading={loadingMembers}
          emptyMessage="No family members found. Add some members to get started!"
        >
          {() => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => (
                <Card
                  key={member.id}
                  className="group hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditDialog(member)}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <LuPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 text-destructive"
                        >
                          <LuTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Points:</span>
                      <span className="text-lg font-bold text-primary">
                        {member.points}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Chores completed:</span>
                        <span>{member.chore?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Rewards claimed:</span>
                        <span>{member.reward?.length || 0}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => openViewDetailsDialog(member)}
                        className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => openDeductDialog(member)}
                        className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground h-9 px-3"
                      >
                        Deduct Points
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DataWrapper>

        {/* Add Member Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Add a new family member to start tracking their chores and
                rewards.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Input
                  id="role"
                  value={newMember.role}
                  onChange={(e) =>
                    setNewMember({ ...newMember, role: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="e.g., Child, Parent, etc."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="points" className="text-right">
                  Starting Points
                </Label>
                <Input
                  id="points"
                  type="number"
                  value={newMember.points}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      points: parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setIsAddOpen(false)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Add Member
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Member Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
              <DialogDescription>
                Update the member&apos;s information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={memberEdited.name}
                  onChange={(e) =>
                    setMemberEdited({ ...memberEdited, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <Input
                  id="edit-role"
                  value={memberEdited.role}
                  onChange={(e) =>
                    setMemberEdited({ ...memberEdited, role: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-points" className="text-right">
                  Points
                </Label>
                <Input
                  id="edit-points"
                  type="number"
                  value={memberEdited.points}
                  onChange={(e) =>
                    setMemberEdited({
                      ...memberEdited,
                      points: parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setIsEditOpen(false)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleEditMember}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Save Changes
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Deduct Points Dialog */}
        <Dialog open={isDeductOpen} onOpenChange={setIsDeductOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Deduct Points</DialogTitle>
              <DialogDescription>
                Deduct points from {selectedMember?.name}&apos;s account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deduct-points" className="text-right">
                  Points
                </Label>
                <Input
                  id="deduct-points"
                  type="number"
                  value={deductForm.points}
                  onChange={(e) =>
                    setDeductForm({
                      ...deductForm,
                      points: parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deduct-reason" className="text-right">
                  Reason
                </Label>
                <Input
                  id="deduct-reason"
                  value={deductForm.reason}
                  onChange={(e) =>
                    setDeductForm({ ...deductForm, reason: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Why are points being deducted?"
                />
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setIsDeductOpen(false)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeductPoints}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
              >
                Deduct Points
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedMember?.name} - Details</DialogTitle>
              <DialogDescription>
                Detailed information about this family member.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Current Points</Label>
                  <p className="text-2xl font-bold text-primary">
                    {selectedMember?.points}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-lg">{selectedMember?.role}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Completed Chores ({selectedMember?.chore?.length || 0})
                </Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {selectedMember?.chore?.map((chore, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-muted rounded"
                    >
                      <span>{chore.name}</span>
                      <span className="text-sm text-muted-foreground">
                        +{chore.points} pts
                      </span>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">
                      No chores completed yet.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Claimed Rewards ({selectedMember?.reward?.length || 0})
                </Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {selectedMember?.reward?.map((reward, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-muted rounded"
                    >
                      <span>{reward.name}</span>
                      <span className="text-sm text-muted-foreground">
                        -{reward.points} pts
                      </span>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">
                      No rewards claimed yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setIsViewDetailsOpen(false)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
