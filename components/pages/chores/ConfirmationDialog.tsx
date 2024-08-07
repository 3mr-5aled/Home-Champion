import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  choreName: string
  isRelatedToMember: boolean
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  choreName,
  isRelatedToMember,
}) => {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            {isRelatedToMember
              ? `The chore "${choreName}" is related to a member. Deleting it will remove points from the member. Are you sure you want to delete it?`
              : `Are you sure you want to permanently delete the chore "${choreName}"?`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex justify-end">
          <button
            className="mr-2 px-4 py-2 btn btn-outline shadow-btn rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 btn btn-error shadow-btn rounded"
            onClick={onConfirm}
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmationDialog
