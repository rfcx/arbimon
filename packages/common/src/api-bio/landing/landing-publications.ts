import { type AxiosInstance } from 'axios'

// Response type
export interface Publication {
  type: 'Use' | 'Mention' | 'Co-author'
  author: string
  year: number
  title: string
  journal: string
  doiUrl: string
  isRFCxAuthor: boolean
  orgMention: string
  uses: string
  citations: number
}

export type LandingPublicationsResponse = Publication[]

// Route
export const landingPublicationsRoute = '/landing/publications'

// Service
export const apiBioGetLandingPublications = async (apiClient: AxiosInstance): Promise<LandingPublicationsResponse> => {
  const response = await apiClient.get(landingPublicationsRoute)
  return response.data
}
