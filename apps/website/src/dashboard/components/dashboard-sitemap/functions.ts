import { Site } from '@rfcx-bio/common/api-bio/common/sites'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { MapDataSet, MapSiteData } from '~/maps/map-bubble'

export const transformToMapDataset = (sites: Site[]): MapDataSet => ({
  startDate: dayjs(),
  endDate: dayjs(),
  sites,
  data: sites.map(({ name, latitude, longitude }) => {
    return {
      siteName: name,
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      distinctSpecies: {
        site: true
      }
    }
  }),
  maxValues: {}
})

export const generatePopupHtml = (datum: MapSiteData, _: string): string => {
  return ''
}
