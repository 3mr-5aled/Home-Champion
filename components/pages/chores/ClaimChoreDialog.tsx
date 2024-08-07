import { Chore, Member } from "@/common.types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"

interface ClaimChoreDialogProps {
  chore: Chore
  members: Member[]
  handleClaimChore: (chore: Chore, member: Member) => void
}

const ClaimChoreDialog: React.FC<ClaimChoreDialogProps> = ({
  chore,
  members,
  handleClaimChore,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="btn btn-primary custom-btn">Claim Chore</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Claim Chore</DialogTitle>
          <DialogDescription>
            Select a member to claim this chore.
          </DialogDescription>
        </DialogHeader>
        <p className="text-yellow-300">
          Member will claim {chore?.points} points for &quot;{chore?.name}
          &quot;.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {members && members.length > 0 ? (
            members.map((member) => (
              <button
                key={member.id}
                className="btn btn-secondary custom-btn text-white flex flex-col items-center p-2"
                onClick={() => handleClaimChore(chore, member)}
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
  )
}

export default ClaimChoreDialog
