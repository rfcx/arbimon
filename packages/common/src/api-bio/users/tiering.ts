import { type AxiosInstance } from 'axios'

import { type AccountTier, type ProjectType } from '../../dao/types'

export interface PortfolioProjectSummary {
  locationProjectId: number
  slug: string
  name: string
  projectType: ProjectType
  isLocked: boolean
  recordingMinutesCount: number
  collaboratorCount: number
  guestCount: number
  patternMatchingCount: number
}

export interface PortfolioSummaryResponse {
  accountTier: AccountTier
  additionalPremiumProjectSlots: number
  limits: {
    freeProjects: number | null
    premiumProjects: number | null
    unlimitedProjects: number | null
  }
  usage: {
    freeProjects: number
    premiumProjects: number
    unlimitedProjects: number
  }
  ownedProjects: PortfolioProjectSummary[]
}

export interface TierChangeSelection {
  locationProjectId: number
  selectedProjectType: ProjectType
  isLocked: boolean
}

export interface SubmitTierChangeRequestBody {
  toTier: AccountTier
  selections: TierChangeSelection[]
}

export interface SubmitTierChangeResponse {
  accountTier: AccountTier
  projectsUpdated: number
}

export const userPortfolioSummaryRoute = '/profile/portfolio-summary'
export const userTierChangeRoute = '/profile/tier-change'

export const apiGetPortfolioSummary = async (apiClient: AxiosInstance): Promise<PortfolioSummaryResponse | undefined> => {
  return await apiClient.get<PortfolioSummaryResponse>(userPortfolioSummaryRoute).then(res => res.data)
}

export const apiPostTierChange = async (apiClient: AxiosInstance, body: SubmitTierChangeRequestBody): Promise<SubmitTierChangeResponse> => {
  return await apiClient.post<SubmitTierChangeResponse>(userTierChangeRoute, body).then(res => res.data)
}
