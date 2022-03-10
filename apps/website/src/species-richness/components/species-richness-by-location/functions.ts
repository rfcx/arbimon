import { MAP_KEY_RICHNESS_TOTAL } from '@/species-richness/functions'
import { MapSiteData } from '~/maps/map-bubble'

export const generateHtmlPopup = (datum: MapSiteData, _?: string): string => {
  const speciesCounts = Object.keys(datum.distinctSpecies)
    .sort()
    .filter(d => d !== MAP_KEY_RICHNESS_TOTAL)
    .map(key => `${key}: ${datum?.distinctSpecies[key].toString()}`)

  return `<p>${speciesCounts.join('<br />')}</p>`
}
