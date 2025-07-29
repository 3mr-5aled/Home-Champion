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
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
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
              <span
                className={`capitalize font-semibold ${
                  selectedMember.points < 0 ? "text-red-500" : ""
                }`}
              >
                {selectedMember.points}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 p-3 bg-base-200 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Earned</div>
              <div className="font-bold text-success">
                +
                {selectedMember.chore?.reduce(
                  (total, chore) => total + (chore.count * chore.points || 0),
                  0
                ) || 0}{" "}
                points
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                Total Deducted
              </div>
              <div className="font-bold text-error">
                -
                {selectedMember.pointsDeducted?.reduce(
                  (total, deduction) => total + (deduction.points || 0),
                  0
                ) || 0}{" "}
                points
              </div>
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
                  <input
                    type="checkbox"
                    name="my-accordion-2"
                    aria-label="Toggle chore details"
                  />
                  <div className="collapse-title text-xl font-medium">
                    <div className="font-semibold">
                      {chore.name}{" "}
                      <span className="badge badge-primary badge-md">
                        {chore.count} times
                      </span>
                      <span className="badge badge-secondary badge-md ml-2">
                        {chore.points * chore.count} points earned
                      </span>
                    </div>
                  </div>
                  <div className="collapse-content px-7 flex flex-col gap-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      Points per completion: {chore.points}
                    </div>
                    <div className="flex flex-row justify-between items-start">
                      <div>
                        <strong>Completion Dates:</strong>
                        <ol className="list-decimal ml-4 mt-1">
                          {chore.date.map((date, dateIndex) => (
                            <li key={dateIndex} className="text-sm">
                              {formatDate(date)} ({chore.points} points)
                            </li>
                          ))}
                        </ol>
                      </div>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => handleDeleteChore(selectedMember, index)}
                      >
                        Delete chore
                        <LuTrash />
                      </button>
                    </div>
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
                  <input
                    type="checkbox"
                    name="my-accordion-2"
                    aria-label="Toggle reward details"
                  />
                  <div className="collapse-title text-xl font-medium">
                    <div className="font-semibold">
                      {reward.name}{" "}
                      <span className="badge badge-warning badge-md">
                        {reward.count} times
                      </span>
                      <span className="badge badge-secondary badge-md ml-2">
                        {reward.points * reward.count} points spent
                      </span>
                    </div>
                  </div>
                  <div className="collapse-content px-7 flex flex-col gap-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      Points per reward: {reward.points}
                    </div>
                    <div className="flex flex-row justify-between items-start">
                      <div>
                        <strong>Redemption Dates:</strong>
                        <ol className="list-decimal ml-4 mt-1">
                          {reward.date.map((date, dateIndex) => (
                            <li key={dateIndex} className="text-sm">
                              {formatDate(date)} ({reward.points} points)
                            </li>
                          ))}
                        </ol>
                      </div>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() =>
                          handleDeleteReward(selectedMember, index)
                        }
                      >
                        Delete reward
                        <LuTrash />
                      </button>
                    </div>
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
                    <input
                      type="checkbox"
                      name="my-accordion-2"
                      aria-label="Toggle deduction details"
                    />
                    <div className="collapse-title text-xl font-medium">
                      <div className="font-semibold">
                        {deduction.reason}{" "}
                        <span className="badge badge-error badge-md">
                          -{deduction.points} points
                        </span>
                      </div>
                    </div>
                    <div className="collapse-content px-7 flex flex-row justify-between items-center">
                      <div>
                        <div className="text-sm">
                          <strong>Date:</strong> {formatDate(deduction.date)}
                        </div>
                        <div className="text-sm text-error">
                          <strong>Points Deducted:</strong> {deduction.points}
                        </div>
                      </div>
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
