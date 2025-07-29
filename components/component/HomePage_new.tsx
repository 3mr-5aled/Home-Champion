"use client"
import { useEffect, useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Member, Chore, Reward } from "@/common.types"
import {
  LuExternalLink,
  LuMoreHorizontal,
  LuUsers,
  LuClipboardList,
  LuGift,
  LuTrophy,
  LuStar,
  LuCalendar,
  LuClock,
} from "react-icons/lu"
import Header from "./Header"
import Link from "next/link"
import { getMembers } from "@/lib/requests/membersRequests"
import { getChores } from "@/lib/requests/choresRequests"
import { getRewards } from "@/lib/requests/rewardsRequests"
import { useAuth } from "@clerk/nextjs"
import DataWrapper from "@/components/ui/DataWrapper"

export default function HomePage({ appName }: { appName: string }) {
  const [members, setMembers] = useState<Member[]>([])
  const [chores, setChores] = useState<Chore[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const { userId } = useAuth()

  useEffect(() => {
    if (!userId) return

    const loadDashboardData = async () => {
      try {
        const [fetchedMembers, fetchedChores, fetchedRewards] =
          await Promise.all([
            getMembers({ userId }),
            getChores({ userId }),
            getRewards({ userId }),
          ])

        setMembers(fetchedMembers ?? [])
        setChores(fetchedChores ?? [])
        setRewards(fetchedRewards ?? [])
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [userId])

  // Calculate some statistics
  const totalMembers = members.length
  const totalChores = chores.length
  const completedChores = chores.filter((chore) => chore.count > 0).length
  const totalRewards = rewards.length
  const topPerformer = members.reduce(
    (top, member) => (member.points > (top?.points || 0) ? member : top),
    null as Member | null
  )
  const availableChores = chores.filter((chore) => chore.count === 0).length
  const totalPointsEarned = members.reduce(
    (sum, member) => sum + member.points,
    0
  )

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-base-200 w-full">
        <Header appName={appName} />
        <main className="flex-1 p-5 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-base-200 w-full">
      <Header appName={appName} />
      <main className="flex-1 p-5 flex justify-center flex-col items-center">
        <section className="container py-8 sm:py-12 lg:pb-20">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Members
                    </p>
                    <p className="text-2xl font-bold">{totalMembers}</p>
                  </div>
                  <LuUsers className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Active Chores
                    </p>
                    <p className="text-2xl font-bold">{availableChores}</p>
                  </div>
                  <LuClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Points
                    </p>
                    <p className="text-2xl font-bold">{totalPointsEarned}</p>
                  </div>
                  <LuStar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Available Rewards
                    </p>
                    <p className="text-2xl font-bold">{totalRewards}</p>
                  </div>
                  <LuGift className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Family Members */}
            <Card>
              <CardHeader>
                <div className="relative">
                  <div className="absolute top-1 right-1">
                    <Link
                      href="/members"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
                      prefetch={false}
                    >
                      <LuExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <CardTitle>Family Members</CardTitle>
                  <CardDescription>
                    View and manage your family members.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <DataWrapper
                  data={members}
                  noDataMessage="No family members added yet. Add some members to get started!"
                >
                  {() => (
                    <div className="grid gap-4">
                      {members.slice(0, 3).map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border">
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {member.points} points
                              </p>
                            </div>
                          </div>
                          {topPerformer?.id === member.id && (
                            <Badge variant="secondary">
                              <LuTrophy className="h-3 w-3 mr-1" />
                              Top Performer
                            </Badge>
                          )}
                        </div>
                      ))}
                      {members.length > 3 && (
                        <p className="text-sm text-muted-foreground text-center">
                          +{members.length - 3} more members
                        </p>
                      )}
                    </div>
                  )}
                </DataWrapper>
              </CardContent>
              <CardFooter>
                <Link href="/members" className="w-full">
                  <button className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Manage Members
                  </button>
                </Link>
              </CardFooter>
            </Card>

            {/* Active Chores */}
            <Card>
              <CardHeader>
                <div className="relative">
                  <div className="absolute top-1 right-1">
                    <Link
                      href="/chores"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
                      prefetch={false}
                    >
                      <LuExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <CardTitle>Active Chores</CardTitle>
                  <CardDescription>
                    Available chores to complete.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <DataWrapper
                  data={chores.filter((chore) => chore.count === 0)}
                  noDataMessage="No active chores available. All chores have been completed!"
                >
                  {() => (
                    <div className="grid gap-4">
                      {chores
                        .filter((chore) => chore.count === 0)
                        .slice(0, 3)
                        .map((chore) => (
                          <div
                            key={chore.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium">{chore.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {chore.points} points
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <LuClock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Available
                              </span>
                            </div>
                          </div>
                        ))}
                      {chores.filter((chore) => chore.count === 0).length >
                        3 && (
                        <p className="text-sm text-muted-foreground text-center">
                          +
                          {chores.filter((chore) => chore.count === 0).length -
                            3}{" "}
                          more chores
                        </p>
                      )}
                    </div>
                  )}
                </DataWrapper>
              </CardContent>
              <CardFooter>
                <Link href="/chores" className="w-full">
                  <button className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    View All Chores
                  </button>
                </Link>
              </CardFooter>
            </Card>

            {/* Rewards System */}
            <Card>
              <CardHeader>
                <div className="relative">
                  <div className="absolute top-1 right-1">
                    <Link
                      href="/rewards"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
                      prefetch={false}
                    >
                      <LuExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <CardTitle>Reward System</CardTitle>
                  <CardDescription>
                    Available rewards for redemption.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <DataWrapper
                  data={rewards}
                  noDataMessage="No rewards available. Create some rewards to motivate your family!"
                >
                  {() => (
                    <div className="grid gap-4">
                      {rewards.slice(0, 3).map((reward) => (
                        <div
                          key={reward.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{reward.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {reward.points} points
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <LuGift className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      ))}
                      {rewards.length > 3 && (
                        <p className="text-sm text-muted-foreground text-center">
                          +{rewards.length - 3} more rewards
                        </p>
                      )}
                    </div>
                  )}
                </DataWrapper>
              </CardContent>
              <CardFooter>
                <Link href="/rewards" className="w-full">
                  <button className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    View All Rewards
                  </button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Progress Overview */}
          {members.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Family Progress</CardTitle>
                <CardDescription>
                  See how everyone is doing with their chores and points.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {members.map((member) => {
                    const memberCompletedChores = chores.filter((chore) =>
                      chore.members?.some((m) => m.name === member.name)
                    ).length
                    const progress =
                      totalChores > 0
                        ? (memberCompletedChores / totalChores) * 100
                        : 0

                    return (
                      <div key={member.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{member.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              {memberCompletedChores}/{totalChores} chores
                            </span>
                            <Badge variant="outline">{member.points} pts</Badge>
                          </div>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  )
}
