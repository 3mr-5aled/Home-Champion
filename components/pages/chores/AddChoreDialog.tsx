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

interface AddChoreDialogProps {
  newChore: { name: string; points: number }
  setNewChore: (chore: { name: string; points: number }) => void
  handleAddChore: (e: React.FormEvent<HTMLFormElement>) => void
  loading: boolean
}

const AddChoreDialog: React.FC<AddChoreDialogProps> = ({
  newChore,
  setNewChore,
  handleAddChore,
  loading,
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <button className="btn btn-primary custom-btn" disabled={loading}>
        {loading ? "Adding..." : "Add Chore"}
      </button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add Chore</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new chore.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleAddChore}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newChore.name}
              onChange={(e) =>
                setNewChore({ ...newChore, name: e.target.value })
              }
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
              value={newChore.points}
              onChange={(e) =>
                setNewChore({ ...newChore, points: Number(e.target.value) })
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
                Adding
              </div>
            ) : (
              "Add"
            )}
          </button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
)

export default AddChoreDialog
