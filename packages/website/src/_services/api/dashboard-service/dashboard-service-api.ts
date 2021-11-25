import { DashboardGeneratedResponse } from '@rfcx-bio/common/api-types/dashboard'

import { apiClient, Endpoint } from '~/api-helpers/rest'
import { useStore } from '~/store'

export class DashboardService {
  constructor (private readonly baseUrl: string) {}

  async getDashboardInformation (): Promise<any> {
    const store = useStore()
    const projectId = store.selectedProject?.id
    if (!projectId) return null

    const endpoint: Endpoint = ({
      method: 'GET',
      url: `${this.baseUrl}/${projectId}/dashboard-generated`
    })

    return await apiClient.request<DashboardGeneratedResponse>(endpoint)
  }
}
