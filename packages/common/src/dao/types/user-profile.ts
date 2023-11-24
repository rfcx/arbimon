export interface UserProfile {
  id: number
  userIdAuth0: string
  firstName: string
  lastName: string
  image?: string
  organizationIdAffiliated?: number
  createdAt?: Date
  updatedAt?: Date
}
