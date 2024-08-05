import { Dispatch, SetStateAction, FormEvent } from "react"
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
import { Member } from "@/common.types" // Import the Member type

interface EditMemberModalProps {
  isEditOpen: boolean
  setIsEditOpen: Dispatch<SetStateAction<boolean>>
  memberEdited: Member
  setMemberEdited: Dispatch<SetStateAction<Member>>
  handleEditMember: (e: FormEvent<HTMLFormElement>) => void
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isEditOpen,
  setIsEditOpen,
  memberEdited,
  setMemberEdited,
  handleEditMember,
}) => (
  <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
    <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleEditMember}>
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update the member`&apos;`s information below.
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
              value={memberEdited.name}
              onChange={(e) =>
                setMemberEdited({ ...memberEdited, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="relationship" className="text-right col-span-1">
              Relationship
            </Label>
            <select
              id="relationship"
              className="col-span-3 select select-bordered w-full max-w-xs"
              value={memberEdited.role}
              defaultValue="RelationShip"
              required
              onChange={(e) =>
                setMemberEdited({ ...memberEdited, role: e.target.value })
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
            Save Changes
          </button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
)

export default EditMemberModal
