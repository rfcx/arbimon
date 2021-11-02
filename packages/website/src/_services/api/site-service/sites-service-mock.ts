import { getRawSites, simulateDelay } from '~/api-helpers/mock'
import { Project, Site } from '..'

export const getSites = async (project: Project): Promise<Site[]> => {
  return await simulateDelay(
    getRawSites().map(({ site_id: siteId, name, latitude, longitude }) => ({
      siteId,
      name,
      latitude: Number(latitude),
      longitude: Number(longitude)
    }))
  )
}
