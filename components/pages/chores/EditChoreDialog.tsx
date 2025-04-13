import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface EditChoreDialogProps {
  isEditOpen: boolean
  setIsEditOpen: (isOpen: boolean) => void
  choreEdited: { id: number | null; name: string; points: number }
  setChoreEdited: (chore: {
    id: number | null
    name: string
    points: number
  }) => void
  handleEditChore: (e: React.FormEvent<HTMLFormElement>) => void
  loading: boolean
}

const EditChoreDialog: React.FC<EditChoreDialogProps> = ({
  isEditOpen,
  setIsEditOpen,
  choreEdited,
  setChoreEdited,
  handleEditChore,
  loading,
}) => (
  <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
    <DialogTrigger asChild>
      <button className="btn btn-primary custom-btn hidden" disabled={loading}>
        {loading ? "Editing..." : "Edit Chore"}
      </button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Chore</DialogTitle>
        <DialogDescription>
          Make changes to the chore details below.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleEditChore}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Name
            </Label>
            <Input
              id="edit-name"
              value={choreEdited.name}
              onChange={(e) =>
                setChoreEdited({ ...choreEdited, name: e.target.value })
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
              value={choreEdited.points}
              onChange={(e) =>
                setChoreEdited({
                  ...choreEdited,
                  points: Number(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <button
            type="submit"
            className="btn btn-primary custom-btn"
            disabled={loading}
          >
            {loading ? (
              <div className="flex flex-row items-center justify-center">
                <span className="loading loading-spinner loading-sm"></span>{" "}
                Editing
              </div>
            ) : (
              "Edit"
            )}
          </button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
)

export default EditChoreDialog
