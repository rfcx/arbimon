import { TAXONOMY_CLASS_ALL } from '~/api/taxonomy-service'
import { MapSiteData } from '~/maps/map-bubble'

export const generateHtmlPopup = (datum: MapSiteData, _?: string): string => {
  const speciesCounts = Object.keys(datum.distinctSpecies).sort().filter(d => d !== TAXONOMY_CLASS_ALL.name).map(key => `${key}: ${datum?.distinctSpecies[key].toString()}`)
  return `<strong>${datum.siteName}</strong><p>${speciesCounts.join('<br />')}</p>`
}
