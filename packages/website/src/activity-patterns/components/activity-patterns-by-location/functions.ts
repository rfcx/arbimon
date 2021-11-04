import { ACTIVITY_PATTERN_KEYS } from '@/activity-patterns/functions'
import { MapSiteData } from '~/maps/map-bubble'

export const generateDetectionHtmlPopup = (datum: MapSiteData, dataKey: string): string => {
  const value = datum.distinctSpecies[dataKey]
  const info = dataKey === ACTIVITY_PATTERN_KEYS.detectionFrequency && !(typeof value === 'boolean') ? `${value.toFixed(2)}%` : value.toString()
  return `<strong>${datum.siteName}: </strong><span>${info}</span>`
}
