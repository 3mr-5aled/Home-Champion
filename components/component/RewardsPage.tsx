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
  DialogTrigger,
} from "../ui/dialog"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { toast } from "react-toastify"
import { Reward, Member } from "@/common.types"
import {
  getRewards,
  addReward,
  updateReward,
  deleteReward,
  redeemReward,
  getMembersRewards,
} from "@/lib/requests"
import { useAuth } from "@clerk/nextjs"
import { Loading } from "../ui/loading"

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [removedRewards, setRemovedRewards] = useState<Reward[]>([])
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [newReward, setNewReward] = useState({
    name: "",
    points: 0,
    description: "",
  })
  const [rewardEdited, setRewardEdited] = useState({
    id: null,
    name: "",
    points: 0,
    description: "",
  })
  const [loadingRewards, setLoadingRewards] = useState<boolean>(true)

  const { userId, getToken } = useAuth()

  // fetch rewards
  useEffect(() => {
    if (!userId) return
    const fetchRewards = async () => {
      const token = await getToken({ template: "supabase" })
      if (token) {
        const fetchedRewards: Reward[] | null = await getRewards({
          userId,
          token,
        })
        const fetchedMembersRewards: Member[] | null = await getMembersRewards({
          userId,
          token,
        })
        setMembers(fetchedMembersRewards || []) // Ensure fetchedMembersRewards is always an array
        setRewards(fetchedRewards || []) // Ensure fetchedRewards is always an array
        setLoadingRewards(false)
      } else {
        toast.error("Failed to get the token")
      }
    }

    fetchRewards()
  }, [userId, getToken])

  // add a reward
  const handleAddReward = async (e) => {
    e.preventDefault()
    const token = await getToken({ template: "supabase" })

    if (newReward.name && newReward.points && newReward.description) {
      const addedReward = await addReward({ userId, token, newReward })
      if (addedReward) {
        setRewards([...rewards, addedReward[0]])
        setNewReward({ name: "", points: 0, description: "" })
        toast.success("Reward added successfully.")
      }
    }
  }

  // edit rewards
  const handleEditReward = async (e) => {
    e.preventDefault()

    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }
    const result = await updateReward({ token, rewardEdited })
    if (!result) {
      toast.error("Failed to edit reward.")
      return
    }

    const updatedRewards = await getRewards({ userId, token })
    setRewards(updatedRewards || [])
    setRewardEdited({
      id: null,
      name: "",
      points: 0,
      description: "",
    })
    setIsEditOpen(false)
    toast.success("Reward edited successfully!")
  }

  // delete rewards
  const handleDeleteReward = async (rewardToDelete: Reward) => {
    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }

    const response = await deleteReward({ token, rewardToDelete })
    if (response) {
      setRewards((prevRewards) =>
        prevRewards.filter((reward) => reward.id !== rewardToDelete.id)
      )
      toast.success("Reward deleted successfully.")
    }
  }

  // ! redeem a reward
  // redeem a reward
  const handleRedeemReward = async (reward, member) => {
    try {
      const token = await getToken({ template: "supabase" })

      const result = await redeemReward({ token, reward, member })

      if (result) {
        // Update members state
        const updatedMembers = members.map((m) =>
          m.id === member.id ? { ...m, points: result.memberData[0].points } : m
        )

        // Update rewards state
        const updatedRewards = rewards.map((r) =>
          r.id === reward.id
            ? {
                ...r,
                members: r.members.some((m) => m.id === member.id)
                  ? r.members.map((m) =>
                      m.id === member.id
                        ? {
                            ...m,
                            count: m.count + 1,
                            date: [...m.date, new Date().toISOString()],
                          }
                        : m
                    )
                  : [
                      ...r.members,
                      {
                        id: member.id,
                        name: member.name,
                        role: member.role,
                        count: 1,
                        date: [new Date().toISOString()],
                      },
                    ],
              }
            : r
        )

        setMembers(updatedMembers)
        setRewards(updatedRewards)
        toast.success("Reward redeemed successfully!")
      } else {
        toast.error("Failed to redeem reward.")
      }
    } catch (error) {
      toast.error("Error handling redeem reward:", error.message)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex flex-row">
          <Link
            href="/"
            className="bg-base-200 rounded-full w-fit h-fit border-2 border-white text-white p-3 mx-3 font-bold"
            prefetch={false}
          >
            <LuArrowLeft />
          </Link>
          <h1 className="text-3xl font-bold">Rewards</h1>
        </div>
        <p className="px-5">Earn points to redeem rewards.</p>
        <div className="mt-4 flex justify-end space-x-2">
          {/* add a reward modal*/}
          <Dialog>
            <DialogTrigger asChild>
              <button className="btn btn-primary custom-btn">Add Reward</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Reward</DialogTitle>
                <DialogDescription>
                  Enter the details of the new reward.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddReward} className="grid gap-4 py-4">
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label htmlFor="reward-name" className="text-right">
                    Reward Name
                  </Label>
                  <Input
                    id="reward-name"
                    placeholder="Enter reward name"
                    className="col-span-3"
                    value={newReward.name}
                    onChange={(e) =>
                      setNewReward({ ...newReward, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label htmlFor="reward-points" className="text-right">
                    Points
                  </Label>
                  <Input
                    id="reward-points"
                    type="number"
                    placeholder="Enter points"
                    className="col-span-3"
                    value={newReward.points}
                    onChange={(e) =>
                      setNewReward({ ...newReward, points: e.target.value })
                    }
                  />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label htmlFor="reward-description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="reward-description"
                    placeholder="Enter description"
                    className="col-span-3"
                    value={newReward.description}
                    onChange={(e) =>
                      setNewReward({
                        ...newReward,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <DialogFooter>
                  <button type="submit" className="btn btn-primary custom-btn">
                    Add Reward
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {/* manage reward modal */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="btn btn-secondary custom-btn">
                Manage Rewards
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-[80%] overflow-y-auto sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Manage the Rewards</DialogTitle>
                <DialogDescription>Edit & Delete the Rewards</DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                {rewards && rewards.length > 0 ? (
                  rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="flex justify-between items-center p-2 border-b"
                    >
                      <div className="flex flex-col">
                        <span className="text-white font-semibold">
                          {reward.name}
                        </span>
                        <span className="text-yellow-500">
                          {reward.points} points
                        </span>
                        <span className="text-gray-500">
                          {reward.description}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-secondary text-white custom-btn"
                          onClick={() => {
                            setRewardEdited(reward)
                            setIsEditOpen(true)
                          }}
                        >
                          <LuPencil />
                        </button>
                        <button
                          className="btn btn-error text-white custom-btn"
                          onClick={() => handleDeleteReward(reward)}
                        >
                          <LuTrash />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-lg text-gray-500">
                    No rewards available. Add a new reward to manage it here.
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {loadingRewards ? (
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
            <Loading />
          </div>
        ) : rewards && rewards.length > 0 ? (
          rewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-base-200 rounded-lg card shadow-card"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{reward.name}</h2>
                <p className="text-muted-foreground mb-4">
                  {reward.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {reward.points} pts
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="btn btn-secondary custom-btn">
                        Redeem Reward
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Redeem a Reward</DialogTitle>
                        <DialogDescription>
                          Choose a member to redeem
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {members && members.length > 0 ? (
                          members.map((member) => (
                            <button
                              key={member.id}
                              className={`btn custom-btn text-white ${
                                member.points < reward.points
                                  ? "btn-disabled"
                                  : "btn-secondary"
                              }`}
                              disabled={member.points < reward.points}
                              onClick={() => handleRedeemReward(reward, member)}
                            >
                              {member.name} - {member.points}
                            </button>
                          ))
                        ) : (
                          <div className="text-center text-lg text-gray-500">
                            No members available to redeem this reward.
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="bg-base-300 p-4 h-full rounded-b-lg">
                <h3 className="text-lg font-bold mb-2">Achieved by:</h3>
                <div className="flex items-center justify-start gap-3 flex-wrap w-fit ">
                  {reward.members && reward.members.length > 0 ? (
                    reward.members.map((member) => (
                      <div
                        key={member.id}
                        className="tooltip"
                        data-tip={member.name}
                      >
                        <div className="avatar placeholder cursor-pointer">
                          <div className="bg-neutral text-neutral-content w-10 rounded-full">
                            <Dialog>
                              <DialogTrigger asChild>
                                <span className="text-lg">
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle className="text-xl">
                                    {member.name}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Days on which member redeemed the reward
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="m-4">
                                  <ol className="list-decimal">
                                    {member.date.map((date) => {
                                      {
                                        const formattedDate = new Date(
                                          date
                                        ).toLocaleString("en-US", {
                                          year: "numeric",
                                          month: "2-digit",
                                          day: "2-digit",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                        return (
                                          <li key={date}>{formattedDate}</li>
                                        )
                                      }
                                    })}
                                  </ol>
                                </div>
                              </DialogContent>
                            </Dialog>
                            {member.count > 1 && (
                              <span className="absolute top-0 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                {member.count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-lg text-gray-500">
                      No members available to redeem this reward.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-lg text-gray-500">
            Add new rewards to manage them here.
          </div>
        )}
      </div>

      {/* Edit reward modal */}
      {isEditOpen && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Reward</DialogTitle>
              <DialogDescription>Update the reward details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditReward} className="grid gap-4 py-4">
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="edit-reward-name" className="text-right">
                  Reward Name
                </Label>
                <Input
                  id="edit-reward-name"
                  placeholder="Enter reward name"
                  className="col-span-3"
                  value={rewardEdited.name}
                  onChange={(e) =>
                    setRewardEdited({ ...rewardEdited, name: e.target.value })
                  }
                />
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="edit-reward-points" className="text-right">
                  Points
                </Label>
                <Input
                  id="edit-reward-points"
                  type="number"
                  placeholder="Enter points"
                  className="col-span-3"
                  value={rewardEdited.points}
                  onChange={(e) =>
                    setRewardEdited({ ...rewardEdited, points: e.target.value })
                  }
                />
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="edit-reward-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="edit-reward-description"
                  placeholder="Enter description"
                  className="col-span-3"
                  value={rewardEdited.description}
                  onChange={(e) =>
                    setRewardEdited({
                      ...rewardEdited,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <DialogFooter>
                <button type="submit" className="btn btn-primary custom-btn">
                  Save Changes
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
