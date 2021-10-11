import { SiteModels } from '@/models'
import { getRawSites, simulateDelay } from './mock-helper'

export const getSites = async (): Promise<SiteModels.Site[]> => {
  return await simulateDelay(
    getRawSites().map(s => {
      const { name, latitude, longitude } = s
      return {
        id: s.site_id,
        name,
        latitude: Number(latitude),
        longitude: Number(longitude)
      }
    })
  )
}
