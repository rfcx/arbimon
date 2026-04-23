import { type AxiosInstance } from 'axios'

import { type AccountTier, type ProjectType } from '../dao/types'

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
  accountTierUpdatedAt?: string | null
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

interface LegacyPortfolioProjectSummary {
  projectId: number
  name: string
  url: string
  isPrivate: boolean
  projectType: ProjectType
  isLocked: boolean
}

interface LegacyPortfolioSummaryResponse {
  accountTier: AccountTier
  accountTierUpdatedAt?: string | null
  additionalPremiumProjectSlots: number
  limits: Record<ProjectType, number | null>
  activeCounts: Record<ProjectType, number>
  projects: LegacyPortfolioProjectSummary[]
}

interface LegacyTierChangeResponse {
  accountTier: AccountTier
  projects: Array<{
    projectId: number
  }>
}

export const userPortfolioSummaryRoute = '/legacy-api/user/tiering'
export const userTierChangeRoute = '/legacy-api/user/tiering/downgrade'

const mapLegacyProject = (project: LegacyPortfolioProjectSummary): PortfolioProjectSummary => ({
  locationProjectId: project.projectId,
  slug: project.url,
  name: project.name,
  projectType: project.projectType,
  isLocked: project.isLocked,
  recordingMinutesCount: 0,
  collaboratorCount: 0,
  guestCount: 0,
  patternMatchingCount: 0
})

export const apiGetPortfolioSummary = async (apiClient: AxiosInstance): Promise<PortfolioSummaryResponse | undefined> => {
  return await apiClient.get<LegacyPortfolioSummaryResponse>(userPortfolioSummaryRoute).then(res => ({
    accountTier: res.data.accountTier,
    accountTierUpdatedAt: res.data.accountTierUpdatedAt,
    additionalPremiumProjectSlots: Number(res.data.additionalPremiumProjectSlots ?? 0),
    limits: {
      freeProjects: res.data.limits.free,
      premiumProjects: res.data.limits.premium,
      unlimitedProjects: res.data.limits.unlimited
    },
    usage: {
      freeProjects: Number(res.data.activeCounts.free ?? 0),
      premiumProjects: Number(res.data.activeCounts.premium ?? 0),
      unlimitedProjects: Number(res.data.activeCounts.unlimited ?? 0)
    },
    ownedProjects: res.data.projects.map(mapLegacyProject)
  }))
}

export const apiPostTierChange = async (apiClient: AxiosInstance, body: SubmitTierChangeRequestBody): Promise<SubmitTierChangeResponse> => {
  return await apiClient.post<LegacyTierChangeResponse>(userTierChangeRoute, {
    targetTier: body.toTier,
    projectSelections: body.selections.map(selection => ({
      projectId: selection.locationProjectId,
      projectType: selection.selectedProjectType,
      isLocked: selection.isLocked
    }))
  }).then(res => ({
    accountTier: res.data.accountTier,
    projectsUpdated: res.data.projects.length
  }))
}
