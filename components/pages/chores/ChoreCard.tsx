import { Chore, Member } from "@/common.types"
import ClaimChoreDialog from "./ClaimChoreDialog"
import ViewClaimedMembersDialog from "./ViewClaimedMembersDialog"

interface ChoreCardProps {
  chore: Chore
  members: Member[]
  setSelectedChore: (chore: Chore | null) => void
  handleClaimChore: (chore: Chore, member: Member) => void
}

const ChoreCard: React.FC<ChoreCardProps> = ({
  chore,
  members,
  setSelectedChore,
  handleClaimChore,
}) => (
  <div className="rounded-lg bg-base-200 border-2 border-black p-6 shadow-card">
    <div className="flex flex-row flex-wrap sm:flex-nowrap items-center gap-2 justify-between w-full">
      <div className="w-1/2">
        <h3 className="text-lg font-medium">{chore.name}</h3>
        <p className="text-yellow-300">{chore.points} points</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-end items-center w-full">
        <ClaimChoreDialog
          chore={chore}
          members={members}
          handleClaimChore={handleClaimChore}
        />
        <ViewClaimedMembersDialog
          chore={chore}
          setSelectedChore={setSelectedChore}
        />
      </div>
    </div>
  </div>
)

export default ChoreCard
