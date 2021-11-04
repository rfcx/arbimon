import { MapSiteData } from '~/maps/map-bubble'

export const generateDetectionHtmlPopup = (datum: MapSiteData, dataKey: string): string => {
  return `<strong>${datum.siteName}: </strong><span>${datum.distinctSpecies[dataKey].toString()}</span>`
}
