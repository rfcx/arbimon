import { DashboardGeneratedResponse, dashboardUrl } from '@rfcx-bio/common/api-bio-types/dashboard-generated'

import { apiClient, Endpoint } from '~/api-helpers/rest'
import { DashboardData } from '../dashboard'

export class DashboardService {
  constructor (private readonly baseUrl: string) {}

  async getDashboardInformation (projectId: string): Promise<DashboardData | undefined> {
    const endpoint: Endpoint = ({
      method: 'GET',
      url: `${this.baseUrl}${dashboardUrl({ projectId })}`
    })

    console.log(endpoint.url)

    try {
      const body = await apiClient.request<DashboardGeneratedResponse>(endpoint)
      // TODO - Validate data is correct type
      // TODO - Transform as necessary
      return body
    } catch (err) {
      return undefined
    }
  }
}
