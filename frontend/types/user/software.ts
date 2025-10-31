export interface Software {
  id: number
  name: string
  description: string
  websiteLink: string
  price: string
  mprice: string
  filename: string
}

export interface AppliedProject {
  id: number
  userId: number
  projectId: number
  username: string
  projectName: string
  applyDate: string
  isApply: number
  purchaseDate: string | null
  periodicity: number | null
  filename: string
}

export type SubscriptionType = 'trial' | 'monthly' | 'annual'
