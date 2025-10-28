export interface User {
  id: number
  email: string
  firstname: string
  lastname: string
  company: string
  hotelname: string
  status: number
  isVerify: number
  role: number
}

export interface AppliedProject {
  id: number
  userId: number
  projectId: number
  projectName: string
  isApply: number
  applyDate: string
  purchaseDate?: string
  filename?: string
}

export interface ProjectSubscriber {
  userId: number
  applyDate: string
  isApply: number
}

export interface UniqueProject {
  projectId: number
  projectName: string
  totalSubscribers: number
  subscribers: ProjectSubscriber[]
}
