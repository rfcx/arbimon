import { getRawSites, simulateDelay } from '@/_services/api-helpers/mock'
import { Site } from '..'

export const getSites = async (): Promise<Site[]> => {
  return await simulateDelay(
    getRawSites().map(({ site_id: siteId, name, latitude, longitude }) => ({
      siteId,
      name,
      latitude: Number(latitude),
      longitude: Number(longitude)
    }))
  )
}
