import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LuPencil, LuTrash } from "react-icons/lu"
import { Chore } from "@/common.types"

interface ManageChoresDialogProps {
  chores: Chore[]
  setChoreEdited: (chore: {
    id: number | null
    name: string
    points: number
  }) => void
  setIsEditOpen: (isOpen: boolean) => void
  handleDeleteChore: (choreToDelete: Chore) => void
  deletingChoreId: number | null
}

const ManageChoresDialog: React.FC<ManageChoresDialogProps> = ({
  chores,
  setChoreEdited,
  setIsEditOpen,
  handleDeleteChore,
  deletingChoreId,
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <button className="btn btn-secondary custom-btn">Manage Chores</button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>Manage Chores</DialogTitle>
        <DialogDescription>Edit or delete your chores here.</DialogDescription>
      </DialogHeader>
      <div className="mt-4 divide-y-2 space-y-2 divide-white">
        {chores.length > 0 ? (
          chores.map((chore) => (
            <div
              key={chore.id}
              className="flex justify-between items-center p-2"
            >
              <div className="flex flex-col">
                <span className="text-white font-semibold">{chore.name}</span>
                <span className="text-yellow-500">{chore.points} points</span>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-secondary text-white custom-btn"
                  onClick={() => {
                    setChoreEdited(chore)
                    setIsEditOpen(true)
                  }}
                >
                  <LuPencil />
                </button>
                <button
                  className="btn btn-error text-white custom-btn"
                  onClick={() => handleDeleteChore(chore)}
                  disabled={deletingChoreId !== null}
                >
                  {deletingChoreId === chore.id ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <LuTrash />
                  )}
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
)

export default ManageChoresDialog
