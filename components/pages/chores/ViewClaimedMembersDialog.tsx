import { Chore } from "@/common.types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ViewClaimedMembersDialogProps {
  chore: Chore
  setSelectedChore: (chore: Chore | null) => void
}

const ViewClaimedMembersDialog: React.FC<ViewClaimedMembersDialogProps> = ({
  chore,
  setSelectedChore,
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <button
        className="btn btn-secondary custom-btn"
        onClick={() => setSelectedChore(chore)}
      >
        View Claimed Members
      </button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Claimed Members</DialogTitle>
        <DialogDescription>
          Members who have claimed this chore.
        </DialogDescription>
      </DialogHeader>
      <div className="join join-vertical w-full">
        {chore.members && chore.members.length > 0 ? (
          chore.members.map((member) => (
            <div
              key={member.id}
              className="collapse collapse-arrow join-item rounded-lg border-secondary border"
            >
              <input
                type="checkbox"
                name="my-accordion-4"
                aria-label="Expand or collapse member details"
              />
              <div className="collapse-title text-xl font-medium">
                {member.name} -{" "}
                <span className="text-yellow-400">{member.count}</span> times
              </div>
              <div className="collapse-content">
                <div className="m-4">
                  <ol className="list-decimal divide-y-2 divide-secondary w-fit space-y-1">
                    {member.date && member.date.length > 0
                      ? member.date.map((date) => {
                          {
                            const formattedDate = new Date(date).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                            return <li key={date}>{formattedDate}</li>
                          }
                        })
                      : null}
                  </ol>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-lg text-gray-500">
            No members available to claim this reward.
          </div>
        )}
      </div>
    </DialogContent>
  </Dialog>
)

export default ViewClaimedMembersDialog
