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
  getMembersChores,
  claimChore,
} from "@/lib/requests" // Import functions from supabaseRequests.ts
import { useAuth } from "@clerk/nextjs"

export default function ChoresPage() {
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null)
  const [chores, setChores] = useState<Chore[]>([]) // Ensure chores is always an array
  const [members, setMembers] = useState<Member[]>([])
  const [removedChore, setRemovedChore] = useState<Chore[]>([])
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
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

  const { userId, getToken } = useAuth()

  // fetch chores
  useEffect(() => {
    if (!userId) return
    const fetchChores = async () => {
      const token = await getToken({ template: "supabase" })
      if (token) {
        const fetchedChores: Chore[] | null = await getChores({
          userId,
          token,
        })
        const fetchedMembersChores: Member[] | null =
          (await getMembersChores({
            userId,
            token,
          })) || null

        setChores(fetchedChores || [])
        setMembers(fetchedMembersChores || [])
        setLoadingChores(false)
        console.log(fetchedChores)
      } else {
        // Handle the case when token is null
        // You can display an error message or take any other appropriate action
        toast.error("Failed to get the token")
      }
    }

    fetchChores()
  }, [userId, getToken])

  // add a chore
  interface NewChore {
    name: string
    points: number
  }

  const handleAddChore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const token = await getToken({ template: "supabase" })

    if (!userId) {
      toast.error("User ID is missing.")
      return
    }

    if (!token) {
      toast.error("Failed to get the token.")
      return
    }

    if (newChore.name && newChore.points) {
      const addedChore = await addChore({ userId, token, newChore })
      if (addedChore) {
        setChores([...chores, addedChore[0]])
        setNewChore({ name: "", points: 0 })
        toast.success("Chore added successfully.")
      }
    }
  }

  // edit chores
  interface EditedChore {
    id: string | null
    name: string
    points: number
  }

  const handleEditChore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }
    const result = await updateChore({
      token,
      choreEdited: { ...choreEdited, id: choreEdited.id?.toString() || "" },
    })
    if (!result) {
      toast.error("Failed to edit chore.")
      return
    }

    if (!userId) {
      toast.error("User ID is missing.")
      return
    }
    const updatedChores = await getChores({ userId, token })
    setChores(updatedChores || [])
    setChoreEdited({
      id: null,
      name: "",
      points: 0,
      count: 0,
      date: [],
    })
    setIsEditOpen(false)
    toast.success("chore edited successfully!")
  }

  // delete chores
  const handleDeleteChore = async (choreToDelete: Chore) => {
    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }

    const response = await deleteChore({ token, choreToDelete })
    if (response) {
      setChores((prevChores) =>
        prevChores.filter((chore) => chore.id !== choreToDelete.id)
      )
      toast.success("Chore deleted successfully.")
    }
  }

  // claim a chore
  interface ClaimChoreParams {
    token: string
    chore: Chore
    member: Member
  }

  interface MemberData {
    id: string
    points: number
  }

  interface ClaimChoreResult {
    memberData: MemberData[]
  }

  const handleClaimChore = async (
    chore: Chore,
    member: Member
  ): Promise<void> => {
    try {
      const token = await getToken({ template: "supabase" })

      const result: ClaimChoreResult | null = await claimChore({
        token: token ?? "",
        chore: { ...chore, id: String(chore.id) },
        member: { ...member, id: String(member.id) },
      })

      if (result) {
        // Update members state
        const updatedMembers: Member[] = members.map((m) =>
          m.id === member.id ? { ...m, points: result.memberData[0].points } : m
        )

        // Update chores state
        const updatedChores: Chore[] = chores.map((r) =>
          r.id === chore.id
            ? {
                ...r,
                members: (r.members ?? []).some((m) => m.id === member.id)
                  ? (r.members ?? []).map((m) =>
                      m.id === member.id
                        ? {
                            ...m,
                            count: (m.count ?? 0) + 1,
                            date: [...(m.date || []), new Date().toISOString()],
                          }
                        : m
                    )
                  : [
                      ...(r.members ?? []),
                      {
                        id: member.id,
                        name: member.name,
                        role: member.role,
                        points: member.points, // Ensure points are included
                        count: 1,
                        date: [new Date().toISOString()],
                      } as Member, // Explicitly cast to Member
                    ],
              }
            : r
        )

        setMembers(updatedMembers)
        setChores(updatedChores)
        toast.success(`${member.name} claimed the chore successfully!`)
      } else {
        toast.error("Failed to claim chore.")
      }
    } catch (error: any) {
      toast.error("Error handling claim chore:", error.message)
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
          <h1 className="text-3xl font-bold">Home Chores</h1>
        </div>
        <p className="px-5">Complete chores to earn points for your family.</p>
        <div className="mt-4 flex justify-end space-x-2">
          {/* add a chore modal*/}
          <Dialog>
            <DialogTrigger asChild>
              <button className="btn btn-primary custom-btn">Add Chore</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Chore</DialogTitle>
                <DialogDescription>
                  Enter the details of the new chore.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddChore} className="grid gap-4 py-4">
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label htmlFor="chore-name" className="text-right">
                    Chore Name
                  </Label>
                  <Input
                    id="chore-name"
                    placeholder="Enter chore name"
                    className="col-span-3"
                    value={newChore.name}
                    onChange={(e) =>
                      setNewChore({ ...newChore, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                  <Label htmlFor="chore-points" className="text-right">
                    Points
                  </Label>
                  <Input
                    id="chore-points"
                    type="number"
                    placeholder="Enter points"
                    className="col-span-3"
                    value={newChore.points}
                    onChange={(e) =>
                      setNewChore({
                        ...newChore,
                        points: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>
                <DialogFooter>
                  <button type="submit" className="btn btn-primary custom-btn">
                    Add Chore
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {/* manage chore modal */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="btn btn-secondary custom-btn">
                Manage Chores
              </button>
            </DialogTrigger>
            <DialogContent className="max-h-4/5 overflow-y-auto sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Manage the Chores</DialogTitle>
                <DialogDescription>Edit & Delete the Chores</DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                {chores.length > 0 ? (
                  chores.map((chore) => (
                    <div
                      key={chore.id}
                      className="flex justify-between items-center p-2 border-b"
                    >
                      <div className="flex flex-col">
                        <span className="text-white font-semibold">
                          {chore.name}
                        </span>
                        <span className="text-yellow-500">
                          {chore.points} points
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-secondary text-white custom-btn"
                          onClick={() => {
                            setChoreEdited(chore)
                            setIsEditOpen(true)
                          }}
                          title="Edit chore"
                        >
                          <LuPencil />
                          <button
                            className="btn btn-error text-white custom-btn"
                            onClick={() => handleDeleteChore(chore)}
                            title="Delete chore"
                          >
                            <LuTrash />
                          </button>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-lg text-gray-500">
                    No chores available. Add a new chore to manage it here.
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid gap-6">
        {chores.length > 0 ? (
          chores.map((chore) => (
            <div key={chore.id} className="rounded-lg border bg-base-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{chore.name}</h3>
                  <p className="text-yellow-300">{chore.points} points</p>
                </div>
                <div className="space-x-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="btn btn-secondary custom-btn"
                        onClick={() => setSelectedChore(chore)}
                      >
                        Claim Points
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Claim a Chore</DialogTitle>
                        <DialogDescription>
                          Choose a member to claim
                        </DialogDescription>
                      </DialogHeader>
                      <p className="text-yellow-300">
                        member will claim {selectedChore?.points} points for
                        &quot;
                        {selectedChore?.name}&quot;.
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {members && members.length > 0 ? (
                          members.map((member) => (
                            <button
                              key={member.id}
                              className="btn btn-secondary custom-btn text-white flex flex-col items-center p-2"
                              onClick={() =>
                                selectedChore &&
                                handleClaimChore(selectedChore, member)
                              }
                            >
                              <span>{member.name}</span>
                              <span>{member.points} pts</span>
                            </button>
                          ))
                        ) : (
                          <div className="text-center text-lg text-gray-500">
                            No members available to claim this chore.
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="btn btn-primary custom-btn">
                        View claimed Members
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>View Members Claimed</DialogTitle>
                        <DialogDescription>
                          view members claimed a chore
                        </DialogDescription>
                      </DialogHeader>
                      <div className="join join-vertical w-full">
                        {chore.members && chore.members.length > 0 ? (
                          chore.members.map((member) => (
                            <div
                              key={member.id}
                              className="collapse collapse-arrow join-item border-base-300 border"
                            >
                              <input
                                type="radio"
                                name="my-accordion-4"
                                title="Expand or collapse section"
                              />
                              <div className="collapse-title text-xl font-medium">
                                {member.name} - {member.count} times
                              </div>
                              <div className="collapse-content">
                                <div className="m-4">
                                  <ol className="list-decimal">
                                    {(member.date ?? []).map((date) => {
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
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-lg text-gray-500">
                            No members available to claim this reward.
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-lg text-gray-500">
            Add new chores to manage them here.
          </div>
        )}
      </div>

      {/* Edit chore modal */}
      {isEditOpen && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Chore</DialogTitle>
              <DialogDescription>Update the chore details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditChore} className="grid gap-4 py-4">
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="edit-chore-name" className="text-right">
                  Chore Name
                </Label>
                <Input
                  id="edit-chore-name"
                  placeholder="Enter chore name"
                  className="col-span-3"
                  value={choreEdited.name}
                  onChange={(e) =>
                    setChoreEdited({ ...choreEdited, name: e.target.value })
                  }
                />
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="edit-chore-points" className="text-right">
                  Points
                </Label>
                <Input
                  id="edit-chore-points"
                  type="number"
                  placeholder="Enter points"
                  className="col-span-3"
                  value={choreEdited.points}
                  onChange={(e) =>
                    setChoreEdited({
                      ...choreEdited,
                      points: parseInt(e.target.value, 10) || 0,
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
