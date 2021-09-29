import rawSites from '@/api/raw-site-01-07-apr-2021.json'
import { SiteModels } from '@/models'

export function getSites (): SiteModels.Site[] {
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
