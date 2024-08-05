export type Member = {
  id: number
  created_at?: string
  name: string
  points: number
  user_id?: string
  role?: string
  pointsDeducted?: {
    date: string
    points: number
    reason: string
  }[]
  reward?: {
    id: number
    name: string
    count: number
    date: string[]
    points: number
    created_at: string
    description: string
  }[]
  chore?: {
    id: number
    name: string
    count: number
    date: string[]
    points: number
    members?: Member[] // Members as array of Member objects
    created_at?: string
  }[]
}

export type Chore = {
  id: number
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
  date: string
  points: number
  reason: string
}
