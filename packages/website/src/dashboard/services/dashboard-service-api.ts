import { DashboardGeneratedResponse, dashboardGeneratedUrl } from '@rfcx-bio/common/api-bio-types/dashboard-generated'
import { DashboardProfileResponse, dashboardProfileUrl } from '@rfcx-bio/common/api-bio-types/dashboard-profile'

import { apiClient } from '~/api-helpers/rest'
import { DashboardGeneratedData, DashboardProfileData } from '../dashboard'

export class DashboardService {
  constructor (private readonly baseUrl: string) {}

  async getDashboardGeneratedData (projectId: string): Promise<DashboardGeneratedData | undefined> {
    const body = await apiClient.getOrUndefined<DashboardGeneratedResponse>(`${this.baseUrl}${dashboardGeneratedUrl({ projectId })}`)
    if (!body) return body

    const { endangered, hilighted, richness, ...metrics } = body

    return { metrics, endangered, hilighted, richness }
  }

  async getDashboardProfileData (projectId: string): Promise<DashboardProfileData | undefined> {
    const body = await apiClient.getOrUndefined<DashboardProfileResponse>(`${this.baseUrl}${dashboardProfileUrl({ projectId })}`)
    return body
  }
}
