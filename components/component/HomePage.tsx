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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Member } from "@/common.types"

import {
  LuSatelliteDish,
  LuBed,
  LuHome,
  LuExternalLink,
  LuMoreHorizontal,
  LuTrash,
  LuGift,
  LuIceCream,
  LuTicket,
  LuTrophy,
} from "react-icons/lu"
import Header from "./Header"
import Link from "next/link"

export default function HomePage({ appName }: { appName: string }) {
  const [members, setMembers] = useState<Member[]>([])

  return (
    <div className="flex min-h-screen flex-col bg-base-200 w-full">
      <Header appName={appName} />
      {/* Content */}
      <main className="flex-1 p-5 flex justify-center flex-col items-center divide-y">
        <section className="container py-8 sm:py-12 lg:pb-20">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Family Members */}
            <Card>
              <CardHeader>
                <div className="relative">
                  <div className="absolute top-1 right-1">
                    <Link
                      href="/members"
                      className="btn btn-neutral"
                      prefetch={false}
                    >
                      <LuExternalLink size={25} />
                    </Link>
                  </div>
                  <CardTitle>Family Members</CardTitle>
                  <CardDescription>
                    View and manage your family members.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">John Doe</h4>
                        <p className="text-sm text-muted-foreground">Son</p>
                      </div>
                    </div>
                    <button className="btn btn-ghost">
                      <LuMoreHorizontal size={25} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">Jane Doe</h4>
                        <p className="text-sm text-muted-foreground">
                          Daughter
                        </p>
                      </div>
                    </div>
                    <button className="btn btn-ghost">
                      <LuMoreHorizontal size={25} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback>BD</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">Baby Doe</h4>
                        <p className="text-sm text-muted-foreground">Toddler</p>
                      </div>
                    </div>
                    <button className="btn btn-ghost">
                      <LuMoreHorizontal size={25} />
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="btn btn-primary custom-btn">
                      Add Family Member
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Family Member</DialogTitle>
                      <DialogDescription>
                        Enter the details of the new family member.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          placeholder="Enter name"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="relationship" className="text-right">
                          Relationship
                        </Label>
                        {/* @ts-ignore */}
                        <Select id="relationship" className="col-span-3">
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="son">Son</SelectItem>
                            <SelectItem value="daughter">Daughter</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <button className="btn btn-primary custom-btn">
                        Add
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
            {/* Tasks */}
            <Card>
              <CardHeader>
                <div className="relative">
                  <div className="absolute top-1 right-1">
                    <Link
                      href="/chores"
                      className="btn btn-neutral"
                      prefetch={false}
                    >
                      <LuExternalLink size={25} />
                    </Link>
                  </div>
                  <CardTitle>Chores</CardTitle>
                  <CardDescription>
                    Create and manage household chores.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-gray-700 p-2">
                        <LuTrash size={20} color="white" />
                      </div>
                      <div>
                        <h4 className="font-medium">Take out the trash</h4>
                        <p className="text-sm text-muted-foreground">
                          50 points
                        </p>
                      </div>
                    </div>
                    <button className="btn btn-ghost">
                      <LuMoreHorizontal size={25} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-gray-700 p-2">
                        <LuSatelliteDish size={20} color="white" />
                      </div>
                      <div>
                        <h4 className="font-medium">Wash the dishes</h4>
                        <p className="text-sm text-muted-foreground">
                          75 points
                        </p>
                      </div>
                    </div>
                    <button className="btn btn-ghost">
                      <LuMoreHorizontal size={25} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-gray-700 p-2">
                        <LuBed size={20} color="white" />
                      </div>
                      <div>
                        <h4 className="font-medium">Make your bed</h4>
                        <p className="text-sm ">25 points</p>
                      </div>
                    </div>
                    <button className="btn btn-ghost">
                      <LuMoreHorizontal size={25} />
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="btn btn-primary custom-btn">
                      Add Chore
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Chore</DialogTitle>
                      <DialogDescription>
                        Enter the details of the new chore.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="chore-name" className="text-right">
                          Chore Name
                        </Label>
                        <Input
                          id="chore-name"
                          placeholder="Enter chore name"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="chore-points" className="text-right">
                          Points
                        </Label>
                        <Input
                          id="chore-points"
                          type="number"
                          placeholder="Enter points"
                          className="col-span-3"
                        />
                      </div>
                      {/* <div className="grid items-center grid-cols-4 gap-4">
                        <Label
                          htmlFor="chore-assigned-to"
                          className="text-right"
                        >
                          Assigned To
                        </Label>
                        <Select id="chore-assigned-to" className="col-span-3">
                          <SelectTrigger>
                            <SelectValue placeholder="Select family member" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="john">John Doe</SelectItem>
                            <SelectItem value="jane">Jane Doe</SelectItem>
                            <SelectItem value="baby">Baby Doe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div> */}
                    </div>
                    <DialogFooter>
                      <button
                        className="btn btn-primary custom-btn"
                        type="submit"
                      >
                        Add Chore
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
            {/* Rewards */}
            <Card>
              <CardHeader>
                <div className="relative">
                  <div className="absolute top-1 right-1">
                    <Link
                      href="/rewards"
                      className="btn btn-neutral"
                      prefetch={false}
                    >
                      <LuExternalLink size={25} />
                    </Link>
                  </div>
                  <CardTitle>Rewards</CardTitle>
                  <CardDescription>
                    Set up a rewards system for your children.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-gray-700 p-2">
                        <LuGift size={20} color="white" />
                      </div>
                      <div>
                        <h4 className="font-medium">New toy</h4>
                        <p className="text-sm text-muted-foreground">
                          500 points
                        </p>
                      </div>
                    </div>
                    <button className="btn btn-ghost">
                      <LuMoreHorizontal size={25} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-gray-700 p-2">
                        <LuTicket size={20} color="white" />
                      </div>
                      <div>
                        <h4 className="font-medium">Movie ticket</h4>
                        <p className="text-sm text-muted-foreground">
                          300 points
                        </p>
                      </div>
                    </div>
                    <button className="btn btn-ghost">
                      <LuMoreHorizontal size={25} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-gray-700 p-2">
                        <LuIceCream size={20} color="white" />
                      </div>
                      <div>
                        <h4 className="font-medium">Ice cream</h4>
                        <p className="text-sm text-muted-foreground">
                          100 points
                        </p>
                      </div>
                    </div>
                    <button className="btn btn-ghost">
                      <LuMoreHorizontal size={25} />
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="btn btn-primary custom-btn">
                      Add Reward
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Reward</DialogTitle>
                      <DialogDescription>
                        Enter the details of the new reward.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="reward-name" className="text-right">
                          Reward Name
                        </Label>
                        <Input
                          id="reward-name"
                          placeholder="Enter reward name"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="reward-points" className="text-right">
                          Points
                        </Label>
                        <Input
                          id="reward-points"
                          type="number"
                          placeholder="Enter points"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <button
                        type="submit"
                        className="btn btn-primary custom-btn"
                      >
                        Add Reward
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>
        </section>
        <section className="container py-8 sm:py-12 lg:py-16">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>
                  See who&#39;s leading the competition.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">John Doe</h4>
                        <p className="text-sm text-muted-foreground">
                          1,200 points
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <LuTrophy size={20} />
                      <span className="font-medium">1st</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">Jane Doe</h4>
                        <p className="text-sm text-muted-foreground">
                          950 points
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <LuTrophy size={20} />
                      <span className="font-medium">2nd</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback>BD</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">Baby Doe</h4>
                        <p className="text-sm text-muted-foreground">
                          650 points
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <LuTrophy size={20} />
                      <span className="font-medium">3rd</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
                <CardDescription>
                  Track your children's progress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="w-5/6">
                        <h4 className="font-medium">John Doe</h4>
                        <Progress value={80} className="w-full rounded-lg" />
                      </div>
                    </div>
                    <span className="font-medium">80%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="w-5/6">
                        <h4 className="font-medium">Jane Doe</h4>
                        <Progress value={65} className="w-full rounded-lg" />
                      </div>
                    </div>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback>BD</AvatarFallback>
                      </Avatar>
                      <div className="w-5/6">
                        <h4 className="font-medium">Baby Doe</h4>
                        <Progress value={45} className="w-full rounded-lg" />
                      </div>
                    </div>
                    <span className="font-medium">45%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
