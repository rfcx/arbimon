import { DashboardGeneratedResponse, dashboardGeneratedUrl } from '@rfcx-bio/common/api-bio/dashboard/dashboard-generated'
import { DashboardProfileResponse, dashboardProfileUrl } from '@rfcx-bio/common/api-bio/dashboard/dashboard-profile'

import { apiClient } from '~/api'

export class DashboardService {
  constructor (private readonly baseUrl: string) {}

  async getDashboardGeneratedData (projectId: string): Promise<DashboardGeneratedResponse | undefined> {
    return await apiClient.getOrUndefined<DashboardGeneratedResponse>(`${this.baseUrl}${dashboardGeneratedUrl({ projectId })}`)
  }

  async getDashboardProfileData (projectId: string): Promise<DashboardProfileResponse | undefined> {
    return await apiClient.getOrUndefined<DashboardProfileResponse>(`${this.baseUrl}${dashboardProfileUrl({ projectId })}`)
  }
}
