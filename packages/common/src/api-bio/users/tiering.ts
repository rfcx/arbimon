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

/** Composite totals across ALL projects the user BELONGS to (any role — not
 * just owned). Backing data: membership rows joined to the
 * `location_project_metric` materialized view (refreshed by the cli sync
 * cycle), so these agree with what each project's own dashboard reports.
 * NOTE `recordingCount` follows the platform's existing convention
 * (dashboard-metrics-dao): it is the `recording_minutes_count` figure that
 * per-project dashboards already display as "totalRecordings". */
export interface PortfolioMemberTotals {
  projectCount: number
  recordingCount: number
  siteCount: number
}

export interface PortfolioSummaryResponse {
  accountTier: AccountTier
  /** PROVISIONAL (2026-08-18): the schema has no billing/expiry column, so for
   * Pro accounts this is derived as `account_tier_updated_at + 1 year` (annual
   * subscription assumption). Absent for Free accounts or when the tier has no
   * recorded update time. Replace with real billing data when it exists. */
  accountTierExpiresAt?: string
  additionalPremiumProjectSlots: number
  memberTotals: PortfolioMemberTotals
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
