import { MAP_KEY_RICHNESS_TOTAL } from '@/landing/species-richness/functions'
import { type MapSiteData } from '~/maps/types'

export const generateHtmlPopup = (datum: MapSiteData, _?: string): string => {
  const speciesCounts = Object.keys(datum.values)
    .sort()
    .filter(d => d !== MAP_KEY_RICHNESS_TOTAL)
    .map(key => `${key}: ${datum?.values[key].toString()}`)

  return `<p>${speciesCounts.join('<br />')}</p>`
}
