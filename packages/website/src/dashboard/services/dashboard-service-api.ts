import { DashboardGeneratedResponse, dashboardGeneratedUrl } from '@rfcx-bio/common/api-bio-types/dashboard-generated'
import { DashboardProfileResponse, dashboardProfileUrl } from '@rfcx-bio/common/api-bio-types/dashboard-profile'
import { DashboardRichnessResponse, dashboardRichnessUrl } from '@rfcx-bio/common/api-bio-types/dashboard-richness'

import { DashboardRichnessData } from '@/dashboard/components/dashboard-top-taxons/dashboard-top-taxons'
import { apiClient } from '~/api-helpers/rest'
import { DashboardGeneratedData, DashboardProfileData } from '../dashboard'

export class DashboardService {
  constructor (private readonly baseUrl: string) {}

  async getDashboardGeneratedData (projectId: string): Promise<DashboardGeneratedData | undefined> {
    const body = await apiClient.getOrUndefined<DashboardGeneratedResponse>(`${this.baseUrl}${dashboardGeneratedUrl({ projectId })}`)
    if (!body) return body

    return { metrics: body }
  }

  async getDashboardProfileData (projectId: string): Promise<DashboardProfileData | undefined> {
    const body = await apiClient.getOrUndefined<DashboardProfileResponse>(`${this.baseUrl}${dashboardProfileUrl({ projectId })}`)
    return body
  }

  async getDashboardRichnessData (projectId: string): Promise<DashboardRichnessData[] | undefined> {
    const body = await apiClient.getOrUndefined<DashboardRichnessResponse[]>(`${this.baseUrl}${dashboardRichnessUrl({ projectId })}`)
    return body
  }
}
