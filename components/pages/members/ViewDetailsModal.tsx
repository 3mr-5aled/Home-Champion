import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import { LuTrash } from "react-icons/lu"
import { Member, Chore, Reward, Deduction } from "@/common.types"

interface ViewDetailsModalProps {
  isViewDetailsOpen: boolean
  setIsViewDetailsOpen: (isOpen: boolean) => void
  selectedMember: Member | null
  handleDeleteChore: (member: Member, index: number) => void
  handleDeleteReward: (member: Member, index: number) => void
  handleDeleteDeduction: (member: Member, index: number) => void
}

const ViewDetailsModal = ({
  isViewDetailsOpen,
  setIsViewDetailsOpen,
  selectedMember,
  handleDeleteChore,
  handleDeleteReward,
  handleDeleteDeduction,
}: ViewDetailsModalProps) => (
  <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Member Details</DialogTitle>
        <DialogDescription>
          View the detailed information of the selected member.
        </DialogDescription>
      </DialogHeader>
      {selectedMember ? (
        <div className="grid gap-4 py-4">
          <div>
            <div>
              Name:{" "}
              <span className="capitalize font-semibold">
                {selectedMember.name}
              </span>
            </div>
          </div>
          <div>
            <div>
              Relationship:{" "}
              <span className="capitalize font-semibold">
                {selectedMember.role}
              </span>
            </div>
          </div>
          <div>
            <div>
              Points:{" "}
              <span className="capitalize font-semibold">
                {selectedMember.points}
              </span>
            </div>
          </div>
          <div className="grid gap-4">
            <div>
              Chores Completed:{" "}
              <span className="capitalize font-semibold">
                {selectedMember.chore?.reduce(
                  (total, chore) => total + (chore.count || 0),
                  0
                ) || "0"}
              </span>
            </div>
            {selectedMember.chore && selectedMember.chore.length > 0 ? (
              selectedMember.chore.map((chore: Chore, index: number) => (
                <div
                  key={index}
                  className="collapse collapse-arrow bg-base-300"
                >
                  <input type="checkbox" name="my-accordion-2" />
                  <div className="collapse-title text-xl font-medium">
                    <div className="font-semibold">
                      {chore.name}{" "}
                      <span className="badge badge-primary badge-md">
                        {chore.count}
                      </span>
                    </div>
                  </div>
                  <div className="collapse-content px-7 flex flex-row justify-between items-center">
                    <ol className="list-decimal">
                      {chore.date.map((date) => (
                        <li key={date}>{formatDate(date)}</li>
                      ))}
                    </ol>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleDeleteChore(selectedMember, index)}
                    >
                      Delete chore
                      <LuTrash />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                No completed chores available.
              </div>
            )}
          </div>
          <div className="grid gap-4">
            <div>
              Rewards Earned:{" "}
              <span className="capitalize font-semibold">
                {selectedMember.reward?.reduce(
                  (total, reward) => total + (reward.count || 0),
                  0
                ) || "0"}
              </span>
            </div>
            {selectedMember.reward && selectedMember.reward.length > 0 ? (
              selectedMember.reward.map((reward: Reward, index: number) => (
                <div
                  key={index}
                  className="collapse collapse-arrow bg-base-300"
                >
                  <input type="checkbox" name="my-accordion-2" />
                  <div className="collapse-title text-xl font-medium">
                    <div className="font-semibold">
                      {reward.name}{" "}
                      <span className="badge badge-primary badge-md">
                        {reward.count}
                      </span>
                    </div>
                  </div>
                  <div className="collapse-content px-7 flex flex-row justify-between items-center">
                    <ol className="list-decimal">
                      {reward.date.map((date) => (
                        <li key={date}>{formatDate(date)}</li>
                      ))}
                    </ol>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleDeleteReward(selectedMember, index)}
                    >
                      Delete reward
                      <LuTrash />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                No earned rewards available.
              </div>
            )}
          </div>
          <div className="grid gap-4">
            <div>
              Number of Punishments:{" "}
              <span className="capitalize font-semibold">
                {selectedMember.pointsDeducted?.length || "0"}
              </span>
            </div>
            {selectedMember.pointsDeducted &&
            selectedMember.pointsDeducted.length > 0 ? (
              selectedMember.pointsDeducted.map(
                (deduction: Deduction, index: number) => (
                  <div
                    key={index}
                    className="collapse collapse-arrow bg-base-300"
                  >
                    <input type="checkbox" name="my-accordion-2" />
                    <div className="collapse-title text-xl font-medium">
                      <div className="font-semibold">{deduction.reason}</div>
                    </div>
                    <div className="collapse-content px-7 flex flex-row justify-between items-center">
                      {formatDate(deduction.date)}
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() =>
                          handleDeleteDeduction(selectedMember, index)
                        }
                      >
                        <LuTrash />
                      </button>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="text-center py-4">
                No points deductions available.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>No member exists</div>
      )}
    </DialogContent>
  </Dialog>
)

export default ViewDetailsModal
