import { type AxiosInstance } from 'axios'

import { type Project } from '../../dao/types'
import { type ProjectUsageLimits } from './project-settings'

export interface ProjectEntitlementSummaryParams {
  slug: string
}

export interface ProjectEntitlementSummaryResponse {
  slug: string
  projectType: NonNullable<Project['projectType']>
  isLocked: Project['isLocked']
  limits: ProjectUsageLimits
}

export const projectEntitlementSummaryRoute = '/projects/:slug/entitlement-summary'

export const apiBioGetProjectEntitlementSummary = async (apiClient: AxiosInstance, slug: string): Promise<ProjectEntitlementSummaryResponse> => {
  return await apiClient.get<ProjectEntitlementSummaryResponse>(`/projects/${slug}/entitlement-summary`).then(res => res.data)
}
