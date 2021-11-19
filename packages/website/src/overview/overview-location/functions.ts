import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { MapDataSet, MapSiteData } from '~/maps/map-bubble'
import { useStore } from '~/store'

export function transformToMapDataset (): MapDataSet {
  const sites = useStore().sites

  const mapDataSet: MapDataSet = {
    startDate: dayjs(),
    endDate: dayjs(),
    sites,
    color: '#fff',
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
  }

  return mapDataSet
}

export const generatePopupHtml = (datum: MapSiteData, _: string): string => {
  return `<span>${datum.siteName}</span>`
}
