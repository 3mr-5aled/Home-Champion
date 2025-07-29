import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  title: string
  itemName: string
  itemType: "chore" | "reward"
  onConfirm: (deleteData: boolean) => void
  isLoading?: boolean
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  setIsOpen,
  title,
  itemName,
  itemType,
  onConfirm,
  isLoading = false,
}) => {
  const [deleteData, setDeleteData] = useState(false)

  const handleConfirm = () => {
    onConfirm(deleteData)
    setDeleteData(false) // Reset for next time
  }

  const handleCancel = () => {
    setIsOpen(false)
    setDeleteData(false) // Reset for next time
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{itemName}&quot;? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              By default, this will only remove the {itemType} from the{" "}
              {itemType}s page. The completion/redemption data will remain in
              member profiles.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="deleteData"
              checked={deleteData}
              onChange={(e) => setDeleteData(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              aria-describedby="deleteData-description"
            />
            <Label
              htmlFor="deleteData"
              className="text-sm"
              id="deleteData-description"
            >
              Also delete all{" "}
              {itemType === "chore" ? "completion" : "redemption"} data and{" "}
              {itemType === "chore"
                ? "deduct points from"
                : "restore points to"}{" "}
              members
            </Label>
          </div>

          {deleteData && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">
                ⚠️ This will permanently remove all{" "}
                {itemType === "chore" ? "completion" : "redemption"} history and{" "}
                {itemType === "chore" ? "deduct" : "restore"} points from
                affected members.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="loading loading-spinner loading-sm"></div>
                Deleting...
              </div>
            ) : (
              `Delete ${itemType === "chore" ? "Chore" : "Reward"}`
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteConfirmationDialog
