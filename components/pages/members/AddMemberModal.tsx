import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Member } from "@/common.types"

interface AddMemberModalProps {
  isAddOpen: boolean
  setIsAddOpen: (open: boolean) => void
  newMember: Member
  setNewMember: (member: Member) => void
  handleAddMember: (e: React.FormEvent<HTMLFormElement>) => void
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isAddOpen,
  setIsAddOpen,
  newMember,
  setNewMember,
  handleAddMember,
}) => (
  <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
    <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleAddMember}>
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Fill out the member`&apos;`s information below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right col-span-1">
              Name
            </Label>
            <Input
              id="name"
              required
              value={newMember.name}
              onChange={(e) =>
                setNewMember({ ...newMember, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="relationship" className="text-right col-span-1">
              Relationship
            </Label>
            <select
              className=" col-span-3 select select-bordered w-full max-w-xs"
              value={newMember.role}
              defaultValue="RelationShip"
              required
              onChange={(e) =>
                setNewMember({ ...newMember, role: e.target.value })
              }
            >
              <option disabled>RelationShip</option>
              <option value="son">Son</option>
              <option value="daughter">Daughter</option>
              <option value="parent">Parent</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <button type="submit" className="btn btn-primary custom-btn">
            Add Member
          </button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
)

export default AddMemberModal
