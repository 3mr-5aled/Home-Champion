export type Member = {
  // Database columns
  id: number
  created_at?: string
  name: string
  points: number
  user_id?: string
  role?: string

  // Client-side properties (not database columns)
  date?: string[]
  count?: number
  pointsDeducted?: Deduction[]
  reward?: Reward[]
  chore?: Chore[]
}

export type Chore = {
  id: number | null
  name: string
  count: number
  date: string[]
  points: number
  members?: Member[] // Make this optional to match the possible `undefined` value
  created_at?: string
}
export type Reward = {
  id: number
  name: string
  description: string
  count: number
  date: string[]
  points: number
  members?: Member[] // This must be provided
  created_at?: string
}
export type Deduction = {
  id: number
  date: string
  points: number
  reason: string
}
