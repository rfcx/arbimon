import * as Endpoints from '@/api/endpoints'
import { SiteModels } from '@/models'
import ApiClient from './api-service'

// Api calling example
export const getSites = async (): Promise<SiteModels.Site[]> => {
  const { method, url } = Endpoints.getSites

  try {
    const resp = await ApiClient.request<SiteModels.Site[]>({
      url,
      method
    })
    return resp
  } catch (e) {
    return await Promise.reject(e)
  }
}
