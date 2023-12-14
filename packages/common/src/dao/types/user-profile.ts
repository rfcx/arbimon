export interface UserProfile {
  id: number
  email: string // idCore + idArbimon
  idAuth0?: string
  firstName: string
  lastName: string
  image?: string
  organizationIdAffiliated?: number
  createdAt?: Date
  updatedAt?: Date
}
