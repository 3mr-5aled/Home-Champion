import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Member } from "@/common.types"

interface MemberCardProps {
  member: Member
  setSelectedMember: (member: Member) => void
  setIsViewDetailsOpen: (isOpen: boolean) => void
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  setSelectedMember,
  setIsViewDetailsOpen,
}) => (
  <Card key={member.id}>
    <CardHeader className="flex items-center gap-4">
      <Avatar className="w-16 h-16 border-2 border-primary">
        <AvatarFallback>
          {member.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-center justify-center">
        <div className="text-lg font-semibold">{member.name}</div>
        <div className="text-gray-400 capitalize">{member.role}</div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold">{member.points}</div>
        <span className="badge badge-secondary px-2">Points</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div>Chores Completed</div>
          <div className="font-semibold">
            {/* {member.chore ? member.chore.length : "0"} */}
            {member.chore?.reduce(
              (total, chore) => total + (chore.count || 0),
              0
            ) || "0"}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>Rewards Earned</div>
          <div className="font-semibold">
            {/* {member.reward ? member.reward.length : "0"} */}
            {member.reward?.reduce(
              (total, reward) => total + (reward.count || 0),
              0
            ) || "0"}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>Number of Punishments</div>
          <div className="font-semibold">
            {member.pointsDeducted ? member.pointsDeducted.length : "0"}
          </div>
        </div>

        <button
          className="w-full btn btn-outline"
          onClick={() => {
            setSelectedMember(member)
            setIsViewDetailsOpen(true)
          }}
        >
          View Details
        </button>
      </div>
    </CardContent>
  </Card>
)

export default MemberCard
