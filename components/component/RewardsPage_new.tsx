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
import { Reward, Member } from "@/common.types"
import {
  getRewards,
  addReward,
  updateReward,
  deleteReward,
} from "@/lib/requests/rewardsRequests"
import { getMembers, redeemReward } from "@/lib/requests/membersRequests"
import { useAuth } from "@clerk/nextjs"
import DataWrapper from "@/components/ui/DataWrapper"

export default function RewardsPage() {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isRedeemOpen, setIsRedeemOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  const [newReward, setNewReward] = useState({
    name: "",
    description: "",
    points: 0,
  })

  const [rewardEdited, setRewardEdited] = useState<Reward>({
    id: 0,
    name: "",
    description: "",
    points: 0,
    count: 0,
    date: [],
    members: [],
  })

  const [loadingRewards, setLoadingRewards] = useState<boolean>(true)
  const { userId } = useAuth()

  useEffect(() => {
    if (!userId) return

    const loadRewardsAndMembers = async () => {
      // Load rewards
      const fetchedRewards = await getRewards({ userId })
      setRewards(fetchedRewards ?? [])

      // Load members
      const fetchedMembers = await getMembers({ userId })
      setMembers(fetchedMembers ?? [])

      setLoadingRewards(false)
    }

    loadRewardsAndMembers()
  }, [userId])

  const loadRewardsAndMembers = async () => {
    if (!userId) return

    // Load rewards
    const fetchedRewards = await getRewards({ userId })
    setRewards(fetchedRewards ?? [])

    // Load members
    const fetchedMembers = await getMembers({ userId })
    setMembers(fetchedMembers ?? [])
  }

  // Add Reward Function
  const handleAddReward = async () => {
    if (!userId) {
      toast.error("User not authenticated")
      return
    }

    const result = await addReward({ userId, newReward })
    if (result) {
      await loadRewardsAndMembers()
      setIsAddOpen(false)
      setNewReward({ name: "", description: "", points: 0 })
      toast.success("Reward added successfully!")
    } else {
      toast.error("Failed to add reward")
    }
  }

  // Edit Reward Function
  const handleEditReward = async () => {
    const result = await updateReward({ rewardEdited })
    if (result) {
      await loadRewardsAndMembers()
      setIsEditOpen(false)
      toast.success("Reward updated successfully!")
    } else {
      toast.error("Failed to update reward")
    }
  }

  // Delete Reward Function
  const handleDeleteReward = async (rewardId: number) => {
    const result = await deleteReward({ rewardId })
    if (result) {
      await loadRewardsAndMembers()
      toast.success("Reward deleted successfully!")
    } else {
      toast.error("Failed to delete reward")
    }
  }

  // Redeem Reward Function
  const handleRedeemReward = async () => {
    if (!selectedReward || !selectedMember) {
      toast.error("Please select a reward and member")
      return
    }

    // Check if member has enough points
    if (selectedMember.points < selectedReward.points) {
      toast.error(
        `Insufficient points! ${selectedMember.name} needs ${
          selectedReward.points - selectedMember.points
        } more points.`
      )
      return
    }

    const result = await redeemReward({
      memberId: selectedMember.id,
      rewardId: selectedReward.id,
    })

    if (result) {
      await loadRewardsAndMembers()
      setIsRedeemOpen(false)
      setSelectedReward(null)
      setSelectedMember(null)
      toast.success("Reward redeemed successfully!")
    } else {
      toast.error("Failed to redeem reward")
    }
  }

  const openEditDialog = (reward: Reward) => {
    setSelectedReward(reward)
    setRewardEdited(reward)
    setIsEditOpen(true)
  }

  const openViewDialog = (reward: Reward) => {
    setSelectedReward(reward)
    setIsViewOpen(true)
  }

  const openRedeemDialog = (reward: Reward) => {
    setSelectedReward(reward)
    setIsRedeemOpen(true)
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
            <h1 className="text-2xl font-bold">Rewards</h1>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Add Reward
          </button>
        </div>

        {/* Rewards Grid */}
        {loadingRewards ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <DataWrapper
            data={rewards}
            noDataMessage="No rewards found. Add some rewards to get started!"
          >
            {() => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="group bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {reward.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {reward.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Cost:</span>
                            <span className="font-bold text-primary">
                              {reward.points} points
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Redeemed:</span>
                            <span>{reward.members?.length || 0} times</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditDialog(reward)}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <LuPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReward(reward.id)}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 text-destructive"
                        >
                          <LuTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => openViewDialog(reward)}
                        className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => openRedeemDialog(reward)}
                        className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DataWrapper>
        )}

        {/* Add Reward Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Reward</DialogTitle>
              <DialogDescription>
                Create a new reward that family members can redeem with their
                points.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reward-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="reward-name"
                  value={newReward.name}
                  onChange={(e) =>
                    setNewReward({ ...newReward, name: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="e.g., Extra screen time"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reward-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="reward-description"
                  value={newReward.description}
                  onChange={(e) =>
                    setNewReward({ ...newReward, description: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Brief description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reward-points" className="text-right">
                  Points Cost
                </Label>
                <Input
                  id="reward-points"
                  type="number"
                  value={newReward.points}
                  onChange={(e) =>
                    setNewReward({
                      ...newReward,
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
                onClick={handleAddReward}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Add Reward
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Reward Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Reward</DialogTitle>
              <DialogDescription>
                Update the reward information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-reward-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-reward-name"
                  value={rewardEdited.name}
                  onChange={(e) =>
                    setRewardEdited({ ...rewardEdited, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-reward-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="edit-reward-description"
                  value={rewardEdited.description || ""}
                  onChange={(e) =>
                    setRewardEdited({
                      ...rewardEdited,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-reward-points" className="text-right">
                  Points Cost
                </Label>
                <Input
                  id="edit-reward-points"
                  type="number"
                  value={rewardEdited.points}
                  onChange={(e) =>
                    setRewardEdited({
                      ...rewardEdited,
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
                onClick={handleEditReward}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Save Changes
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Redeem Reward Dialog */}
        <Dialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Redeem Reward</DialogTitle>
              <DialogDescription>
                Select a family member to redeem this reward:{" "}
                {selectedReward?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label>Select Member</Label>
              <div className="space-y-2">
                {members.map((member) => {
                  const canAfford =
                    member.points >= (selectedReward?.points || 0)
                  return (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      disabled={!canAfford}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        selectedMember?.id === member.id
                          ? "border-primary bg-primary/10"
                          : canAfford
                          ? "border-input hover:bg-accent"
                          : "border-input bg-muted opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{member.name}</span>
                        <div className="text-right">
                          <span
                            className={`text-sm ${
                              canAfford ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            {member.points} pts
                          </span>
                          {!canAfford && (
                            <p className="text-xs text-red-500">
                              Need{" "}
                              {(selectedReward?.points || 0) - member.points}{" "}
                              more
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setIsRedeemOpen(false)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleRedeemReward}
                disabled={
                  !selectedMember ||
                  selectedMember.points < (selectedReward?.points || 0)
                }
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Redeem (-{selectedReward?.points} pts)
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedReward?.name} - Details</DialogTitle>
              <DialogDescription>
                Detailed information about this reward.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Points Cost</Label>
                  <p className="text-2xl font-bold text-primary">
                    {selectedReward?.points}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Times Redeemed</Label>
                  <p className="text-2xl font-bold">
                    {selectedReward?.members?.length || 0}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-muted-foreground">
                  {selectedReward?.description || "No description available"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Redemption History
                </Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {selectedReward?.members?.map((member, index) => (
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
                      No one has redeemed this reward yet.
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
