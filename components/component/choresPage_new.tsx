"use client"

import { useState, useEffect } from "react"
import { LuArrowLeft, LuPencil, LuTrash } from "react-icons/lu"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "react-toastify"
import { Chore, Member } from "@/common.types"
import {
  getChores,
  addChore,
  updateChore,
  deleteChore,
} from "@/lib/requests/choresRequests"
import { getMembers, claimChore } from "@/lib/requests/membersRequests"
import { useAuth } from "@clerk/nextjs"
import DataWrapper from "@/components/ui/DataWrapper"

export default function ChoresPage() {
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null)
  const [chores, setChores] = useState<Chore[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isClaimOpen, setIsClaimOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  const [newChore, setNewChore] = useState({
    name: "",
    points: 0,
  })

  const [choreEdited, setChoreEdited] = useState<Chore>({
    id: null,
    name: "",
    points: 0,
    count: 0,
    date: [],
  })

  const [loadingChores, setLoadingChores] = useState<boolean>(true)
  const { userId } = useAuth()

  useEffect(() => {
    if (!userId) return

    const loadChoresAndMembers = async () => {
      // Load chores
      const fetchedChores = await getChores({ userId })
      setChores(fetchedChores ?? [])

      // Load members
      const fetchedMembers = await getMembers({ userId })
      setMembers(fetchedMembers ?? [])

      setLoadingChores(false)
    }

    loadChoresAndMembers()
  }, [userId])

  const loadChoresAndMembers = async () => {
    if (!userId) return

    // Load chores
    const fetchedChores = await getChores({ userId })
    setChores(fetchedChores ?? [])

    // Load members
    const fetchedMembers = await getMembers({ userId })
    setMembers(fetchedMembers ?? [])

    setLoadingChores(false)
  }

  // Add Chore Function
  const handleAddChore = async () => {
    if (!userId) {
      toast.error("User not authenticated")
      return
    }

    const result = await addChore({ userId, newChore })
    if (result) {
      await loadChoresAndMembers()
      setIsAddOpen(false)
      setNewChore({ name: "", points: 0 })
      toast.success("Chore added successfully!")
    } else {
      toast.error("Failed to add chore")
    }
  }

  // Edit Chore Function
  const handleEditChore = async () => {
    const result = await updateChore({ choreEdited })
    if (result) {
      await loadChoresAndMembers()
      setIsEditOpen(false)
      toast.success("Chore updated successfully!")
    } else {
      toast.error("Failed to update chore")
    }
  }

  // Delete Chore Function
  const handleDeleteChore = async (choreId: number) => {
    const result = await deleteChore({ choreId })
    if (result) {
      await loadChoresAndMembers()
      toast.success("Chore deleted successfully!")
    } else {
      toast.error("Failed to delete chore")
    }
  }

  // Claim Chore Function
  const handleClaimChore = async () => {
    if (!selectedChore || !selectedMember) {
      toast.error("Please select a chore and member")
      return
    }

    const result = await claimChore({
      memberId: selectedMember.id,
      choreId: selectedChore.id!,
    })

    if (result) {
      await loadChoresAndMembers()
      setIsClaimOpen(false)
      setSelectedChore(null)
      setSelectedMember(null)
      toast.success("Chore claimed successfully!")
    } else {
      toast.error("Failed to claim chore")
    }
  }

  const openEditDialog = (chore: Chore) => {
    setSelectedChore(chore)
    setChoreEdited(chore)
    setIsEditOpen(true)
  }

  const openViewDialog = (chore: Chore) => {
    setSelectedChore(chore)
    setIsViewOpen(true)
  }

  const openClaimDialog = (chore: Chore) => {
    setSelectedChore(chore)
    setIsClaimOpen(true)
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
            <h1 className="text-2xl font-bold">Chores</h1>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Add Chore
          </button>
        </div>

        {/* Chores Grid */}
        {loadingChores ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <DataWrapper
            data={chores}
            noDataMessage="No chores found. Add some chores to get started!"
          >
            {() => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chores.map((chore) => (
                  <div
                    key={chore.id}
                    className="group bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {chore.name}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Points:</span>
                            <span className="font-bold text-primary">
                              {chore.points}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Completed:</span>
                            <span>
                              {chore.members?.reduce(
                                (total, member) => total + (member.count || 0),
                                0
                              ) || 0}{" "}
                              times
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditDialog(chore)}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <LuPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChore(chore.id!)}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 text-destructive"
                        >
                          <LuTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => openViewDialog(chore)}
                        className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => openClaimDialog(chore)}
                        className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                      >
                        Claim
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DataWrapper>
        )}

        {/* Add Chore Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Chore</DialogTitle>
              <DialogDescription>
                Create a new chore that family members can complete for points.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="chore-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="chore-name"
                  value={newChore.name}
                  onChange={(e) =>
                    setNewChore({ ...newChore, name: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="e.g., Take out trash"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="chore-points" className="text-right">
                  Points
                </Label>
                <Input
                  id="chore-points"
                  type="number"
                  value={newChore.points}
                  onChange={(e) =>
                    setNewChore({
                      ...newChore,
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
                onClick={handleAddChore}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Add Chore
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Chore Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Chore</DialogTitle>
              <DialogDescription>
                Update the chore information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-chore-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-chore-name"
                  value={choreEdited.name}
                  onChange={(e) =>
                    setChoreEdited({ ...choreEdited, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-chore-points" className="text-right">
                  Points
                </Label>
                <Input
                  id="edit-chore-points"
                  type="number"
                  value={choreEdited.points}
                  onChange={(e) =>
                    setChoreEdited({
                      ...choreEdited,
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
                onClick={handleEditChore}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Save Changes
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Claim Chore Dialog */}
        <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Claim Chore</DialogTitle>
              <DialogDescription>
                Select a family member to claim this chore:{" "}
                {selectedChore?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label>Select Member</Label>
              <div className="space-y-2">
                {members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      selectedMember?.id === member.id
                        ? "border-primary bg-primary/10"
                        : "border-input hover:bg-accent"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {member.points} pts
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setIsClaimOpen(false)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleClaimChore}
                disabled={!selectedMember}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Claim Chore (+{selectedChore?.points} pts)
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedChore?.name} - Details</DialogTitle>
              <DialogDescription>
                Detailed information about this chore.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Points Reward</Label>
                  <p className="text-2xl font-bold text-primary">
                    {selectedChore?.points}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Times Completed</Label>
                  <p className="text-2xl font-bold">
                    {selectedChore?.members?.reduce(
                      (total, member) => total + (member.count || 0),
                      0
                    ) || 0}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Completion History
                </Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {selectedChore?.members?.map((member, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-muted rounded"
                    >
                      <span>{member.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {member.count} time{member.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">
                      No one has completed this chore yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setIsViewOpen(false)}
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
