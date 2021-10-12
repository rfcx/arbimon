import { SiteModels } from '@/models'
import { getRawSites, simulateDelay } from './mock-helper'

export const getSites = async (): Promise<SiteModels.Site[]> => {
  return await simulateDelay(
    getRawSites().map(({ site_id: siteId, name, latitude, longitude }) => ({
      siteId,
      name,
      latitude: Number(latitude),
      longitude: Number(longitude)
    }))
  )
}
