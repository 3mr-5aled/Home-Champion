"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Chore, Member } from "@/common.types"
import {
  getChores,
  addChore,
  updateChore,
  deleteChore,
  hardDeleteChore,
  claimChore,
} from "@/lib/requests"
import { getMembers } from "@/lib/requests/membersRequests"
import { useAuth } from "@clerk/nextjs"

import Header from "@/components/ui/Header"
import {
  AddChoreDialog,
  ManageChoresDialog,
  ChoreCard,
  EditChoreDialog,
  TrashChoresDialog,
} from "@/components/pages/chores"
import DeleteConfirmationDialog from "@/components/pages/common/DeleteConfirmationDialog"

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
  const [claimingChore, setClaimingChore] = useState<boolean>(false)
  const [claimingMemberId, setClaimingMemberId] = useState<number | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false)
  const [deletingChore, setDeletingChore] = useState<boolean>(false)
  const [choreToDelete, setChoreToDelete] = useState<Chore | null>(null)

  const { userId, getToken } = useAuth()

  useEffect(() => {
    if (!userId) return
    const fetchChores = async () => {
      const token = await getToken({ template: "supabase" })
      if (token) {
        const fetchedChores: Chore[] | null = await getChores({ userId })
        const fetchedMembersChores: Member[] | null =
          (await getMembers({
            userId: userId || "",
          })) ?? null
        // Removed fetchedRemovedChores since getDeletedChore doesn't exist

        const fetchedChoresData = await getChores({ userId })
        setChores(fetchedChoresData || [])
        setMembers(fetchedMembersChores || [])
        setRemovedChores([]) // Set empty array since getDeletedChore doesn't exist
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

    if (newChore.name && newChore.points && userId) {
      const addedChore = await addChore({
        userId,
        newChore,
      })
      if (addedChore) {
        // Refresh the chores list
        const updatedChores = await getChores({ userId })
        setChores(updatedChores || [])
        setNewChore({ name: "", points: 0 })
        toast.success("Chore added successfully.")
      } else {
        toast.error("Failed to add chore.")
      }
    } else {
      toast.error("Please fill all fields.")
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

    if (!userId || !choreEdited.id) {
      toast.error("Missing required information.")
      setEditingChore(false)
      return
    }

    const result = await updateChore({
      choreEdited: {
        ...choreEdited,
        id: choreEdited.id,
      } as Chore,
    })

    if (result) {
      const updatedChores: Chore[] | null = await getChores({ userId })
      setChores(updatedChores || [])
      setChoreEdited({ id: null, name: "", points: 0 })
      setIsEditOpen(false)
      toast.success("Chore edited successfully!")
    } else {
      toast.error("Failed to edit chore.")
    }
    setEditingChore(false)
  }

  const handleDeleteChore = async (choreToDelete: Chore) => {
    setChoreToDelete(choreToDelete)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async (deleteData: boolean) => {
    if (!choreToDelete || !userId) {
      toast.error("Missing required information.")
      return
    }

    setDeletingChore(true)
    setIsDeleteConfirmOpen(false)

    try {
      let result
      if (deleteData) {
        // Hard delete - removes all completion data and affects member points
        result = await hardDeleteChore({ choreId: choreToDelete.id || 0 })
      } else {
        // Soft delete - preserves member data
        result = await deleteChore({ choreId: choreToDelete.id || 0 })
      }

      if (result) {
        const updatedChores = await getChores({ userId })
        setChores(updatedChores || [])
        toast.success(
          deleteData
            ? "Chore deleted and all completion data removed from members!"
            : "Chore deleted successfully! Member completion data preserved."
        )
      } else {
        toast.error("Failed to delete chore.")
      }
    } catch (error) {
      console.error("Error deleting chore:", error)
      toast.error("An error occurred while deleting the chore.")
    } finally {
      setDeletingChore(false)
      setChoreToDelete(null)
    }
  }

  const handleClaimChore = async (chore: Chore, member: Member) => {
    if (!userId) {
      toast.error("User ID is missing.")
      return
    }

    setClaimingChore(true)
    setClaimingMemberId(member.id)

    const result = await claimChore({
      memberId: member.id,
      choreId: chore.id || 0,
    })

    if (result) {
      // Update the members list with new points
      const updatedMembers = await getMembers({ userId })
      setMembers(updatedMembers || [])

      // Also update the chores list to reflect the new completion count
      const updatedChores = await getChores({ userId })
      setChores(updatedChores || [])

      toast.success(`${member.name} claimed "${chore.name}" successfully!`)
    } else {
      toast.error("Failed to claim chore.")
    }

    setClaimingChore(false)
    setClaimingMemberId(null)
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
          handlePermanentDeleteChore={() => {}} // Placeholder for now
          deletingChoreId={null}
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
                isClaimingChore={claimingChore}
                claimingMemberId={claimingMemberId}
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
        handleEditChore={handleEditChore}
        loading={editingChore}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        setIsOpen={setIsDeleteConfirmOpen}
        title={`Delete ${choreToDelete?.name}`}
        itemName={choreToDelete?.name || ""}
        itemType="chore"
        onConfirm={handleConfirmDelete}
        isLoading={deletingChore}
      />
    </div>
  )
}
