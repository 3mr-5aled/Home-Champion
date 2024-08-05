import React from "react"
import DataWrapper from "@/components/ui/DataWrapper"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { LuPencil, LuTrash } from "react-icons/lu"
import { Member } from "@/common.types"

interface ManageMembersModalProps {
  isManageOpen: boolean
  setIsManageOpen: (open: boolean) => void
  members: Member[]
  setSelectedMember: (member: Member) => void
  setIsDeductOpen: (open: boolean) => void
  setIsEditOpen: (open: boolean) => void
  setMemberEdited: (member: Member) => void
  handleDeleteMember: (member: Member) => void
}

const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
  isManageOpen,
  setIsManageOpen,
  members,
  setSelectedMember,
  setIsDeductOpen,
  setIsEditOpen,
  setMemberEdited,
  handleDeleteMember,
}) => (
  <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Manage Members</DialogTitle>
        <DialogDescription>
          Edit or delete members from the list below.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <DataWrapper data={members} noDataMessage="No members exist">
          {(members) =>
            members.map((member) => (
              <div
                key={member.name}
                className="flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">{member.name}</div>
                  <div className="text-gray-400">{member.role}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-accent btn-sm"
                    onClick={() => {
                      setSelectedMember(member)
                      setIsDeductOpen(true)
                    }}
                  >
                    Deduct Points
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setMemberEdited(member)
                      setIsEditOpen(true)
                    }}
                  >
                    <LuPencil />
                  </button>
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => handleDeleteMember(member)}
                  >
                    <LuTrash />
                  </button>
                </div>
              </div>
            ))
          }
        </DataWrapper>
      </div>
    </DialogContent>
  </Dialog>
)

export default ManageMembersModal
