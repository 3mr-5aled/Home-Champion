"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Chore, Member } from "@/common.types"
import {
  getChores,
  addChore,
  updateChore,
  deleteChore,
  getMembersChores,
  claimChore,
  getDeletedChore,
  deleteChorePermanently,
  checkChoreRelation,
} from "@/lib/requests"
import { useAuth } from "@clerk/nextjs"

import Header from "@/components/ui/Header"
import {
  AddChoreDialog,
  ManageChoresDialog,
  ChoreCard,
  EditChoreDialog,
  TrashChoresDialog,
  ConfirmationDialog,
} from "@/components/pages/chores"

export default function ChoresPage() {
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null)
  const [chores, setChores] = useState<Chore[]>([])
  const [removedChores, setRemovedChores] = useState<Chore[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [newChore, setNewChore] = useState({ name: "", points: 0 })
  const [choreEdited, setChoreEdited] = useState<{
    id: number | null
    name: string
    points: number
  }>({
    id: null,
    name: "",
    points: 0,
  })
  const [loadingChores, setLoadingChores] = useState<boolean>(true)
  const [addingChore, setAddingChore] = useState<boolean>(false)
  const [editingChore, setEditingChore] = useState<boolean>(false)
  const [deletingChoreId, setDeletingChoreId] = useState<number | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false)
  const [isRelatedToMember, setIsRelatedToMember] = useState<boolean>(false)
  const [choreToDelete, setChoreToDelete] = useState<Chore | null>(null)
  const [choreToConfirm, setChoreToConfirm] = useState<Chore | null>(null)
  const [confirmationMessage, setConfirmationMessage] = useState("")

  const { userId, getToken } = useAuth()

  useEffect(() => {
    if (!userId) return
    const fetchChores = async () => {
      const token = await getToken({ template: "supabase" })
      if (token) {
        const fetchedChores: Chore[] | null = await getChores({ userId, token })
        const fetchedMembersChores: Member[] | null =
          (await getMembersChores({
            userId: userId || "",
            token: token || "",
          })) ?? null
        const fetchedRemovedChores: Chore[] | null = await getDeletedChore({
          userId: userId || "",
          token: token || "",
        })

        const fetchedChoresData = await getChores({ userId, token })
        setChores(fetchedChoresData || [])
        setMembers(fetchedMembersChores || [])
        setRemovedChores(fetchedRemovedChores || [])
        setLoadingChores(false)
      } else {
        toast.error("Failed to get the token")
      }
    }

    fetchChores()
  }, [userId, getToken])

  interface NewChore {
    name: string
    points: number
  }

  interface AddChoreResponse {
    id: number
    name: string
    points: number
  }

  const handleAddChore = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    setAddingChore(true)
    const token = await getToken({ template: "supabase" })

    if (newChore.name && newChore.points) {
      const addedChore: AddChoreResponse[] | null = await addChore({
        userId: userId ?? "",
        token: token ?? "",
        newChore,
      })
      if (addedChore) {
        setChores([
          ...chores,
          { ...addedChore[0], count: 0, date: [] } as Chore,
        ])
        setNewChore({ name: "", points: 0 })
        toast.success("Chore added successfully.")
      } else {
        toast.error("Failed to add chore.")
      }
    }
    setAddingChore(false)
  }

  interface ChoreEdited {
    id: number | null
    name: string
    points: number
  }

  interface UpdateChoreResponse {
    success: boolean
  }

  const handleEditChore = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    setEditingChore(true)

    const token: string | null = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }
    const result: UpdateChoreResponse | null = await updateChore({
      token,
      choreEdited: {
        ...choreEdited,
        id: String(choreEdited.id),
      },
    }).then((response) => {
      if (Array.isArray(response)) {
        return { success: response.length > 0 }
      }
      return response
    })
    if (!result) {
      toast.error("Failed to e chore.")
      return
    }
    if (!userId) {
      toast.error("User ID is missing.")
      setEditingChore(false)
      return
    }
    const updatedChores: Chore[] | null = await getChores({ userId, token })
    setChores(updatedChores || [])
    setChoreEdited({ id: null, name: "", points: 0 })
    setIsEditOpen(false)
    toast.success("Chore edited successfully!")
    setEditingChore(false)
  }

  const handleDeleteChore = async (choreToDelete: Chore) => {
    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }

    // Check if the chore is related to any members
    const { isRelated } = await checkChoreRelation({ token, choreToDelete })

    if (isRelated) {
      setConfirmationMessage(
        `This chore is related to some members. Deleting it will also remove points from those members. Do you want to proceed?`
      )
    } else {
      setConfirmationMessage(
        `Are you sure you want to delete this chore permanently?`
      )
    }

    setChoreToConfirm(choreToDelete)
    setIsConfirmOpen(true)
  }

  const handlePermanentDeleteChore = async () => {
    if (!choreToDelete) return

    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      setDeletingChoreId(null) // Reset the deleting chore ID
      setIsConfirmOpen(false)
      return
    }

    const relationCheck = await checkChoreRelation({ token, choreToDelete })
    setIsRelatedToMember(relationCheck.isRelated)

    if (relationCheck.isRelated) {
      // Show confirmation modal with the message
      setIsConfirmOpen(true)
    } else {
      // If not related, delete immediately
      const success = await deleteChorePermanently({ token, choreToDelete })
      if (success) {
        setRemovedChores((prevRemovedChores) =>
          prevRemovedChores.filter((chore) => chore.id !== choreToDelete.id)
        )
        toast.success("Chore permanently deleted successfully.")
      } else {
        toast.error("Failed to permanently delete chore.")
      }
      setDeletingChoreId(null) // Reset the deleting chore ID
    }
  }

  const confirmPermanentDelete = async () => {
    if (!choreToDelete) return

    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      setDeletingChoreId(null) // Reset the deleting chore ID
      setIsConfirmOpen(false)
      return
    }

    const success = await deleteChorePermanently({
      token,
      choreToDelete,
    })
    if (success) {
      setRemovedChores((prevRemovedChores) =>
        prevRemovedChores.filter((chore) => chore.id !== choreToDelete.id)
      )
      toast.success("Chore permanently deleted successfully.")
    } else {
      toast.error("Failed to permanently delete chore.")
    }
    setDeletingChoreId(null) // Reset the deleting chore ID
    setIsConfirmOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!choreToConfirm) return

    const token = await getToken({ template: "supabase" })
    if (!token) {
      toast.error("Failed to get the token.")
      return
    }

    const success = await deleteChorePermanently({
      token,
      choreToDelete: choreToConfirm,
    })

    if (success) {
      setChores((prevChores) =>
        prevChores.filter((chore) => chore.id !== choreToConfirm.id)
      )
      toast.success("Chore deleted permanently.")
    } else {
      toast.error("Failed to delete chore.")
    }

    setIsConfirmOpen(false)
    setChoreToConfirm(null)
  }

  const handleClaimChore = async (chore: Chore, member: Member) => {
    try {
      const token = await getToken({ template: "supabase" })
      const result = await claimChore({
        token: token ?? "",
        chore: { ...chore, id: String(chore.id) },
        member: { ...member, id: String(member.id) },
      })

      if (result) {
        const updatedMembers = members.map((m) =>
          m.id === member.id ? { ...m, points: result.memberData[0].points } : m
        )
        const updatedChores = chores.map((r) =>
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
                        points: member.points, // Ensure 'points' is included
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred"
      toast.error(`Error handling claim chore: ${errorMessage}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Header title="Chores" description="View and Manage Chores">
        <AddChoreDialog
          newChore={newChore}
          setNewChore={setNewChore}
          handleAddChore={handleAddChore}
          loading={addingChore}
        />
        <ManageChoresDialog
          chores={chores}
          setChoreEdited={(chore) =>
            setChoreEdited((prev) => ({ ...prev, ...chore }))
          }
          setIsEditOpen={setIsEditOpen}
          handleDeleteChore={handleDeleteChore}
          deletingChoreId={deletingChoreId}
        />
        <TrashChoresDialog
          removedChores={removedChores}
          handlePermanentDeleteChore={(chore) => {
            setChoreToDelete(chore)
            handlePermanentDeleteChore()
          }}
          deletingChoreId={deletingChoreId}
        />
      </Header>
      {loadingChores ? (
        <div className="flex min-h-[75vh] justify-center items-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 justify-between items-center gap-6">
          {chores.length > 0 ? (
            chores.map((chore) => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                members={members}
                setSelectedChore={setSelectedChore}
                handleClaimChore={handleClaimChore}
              />
            ))
          ) : (
            <div className="text-center text-lg text-gray-500">
              Add new chores to manage them here.
            </div>
          )}
        </div>
      )}
      <EditChoreDialog
        isEditOpen={isEditOpen}
        setIsEditOpen={setIsEditOpen}
        choreEdited={choreEdited}
        setChoreEdited={setChoreEdited}
        handleEditChore={(e: React.FormEvent<HTMLFormElement>) =>
          handleEditChore(e)
        }
        loading={editingChore}
      />
    </div>
  )
}
