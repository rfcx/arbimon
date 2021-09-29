import * as Endpoints from '@/api/endpoints'
import rawSites from '@/api/raw-site-01-07-apr-2021.json'
import { SiteModels } from '@/models'
import ApiClient from './api.service'

// Api calling example
export async function getSites (): Promise<SiteModels.Site[]> {
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

export function getMockupSites (): SiteModels.Site[] {
  return rawSites.map(s => {
    const { name, latitude, longitude } = s
    return {
      id: s.site_id,
      name,
      latitude: Number(latitude),
      longitude: Number(longitude)
    }
  })
}
