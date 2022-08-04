import { ACTIVITY_OVERVIEW_MAP_KEYS } from '@/activity-overview/functions'
import { MapSiteData } from '~/maps/map-bubble'

const getFormattedValue = (value: number | boolean, dataKey: string): string => {
  switch (dataKey) {
    case ACTIVITY_OVERVIEW_MAP_KEYS.totalDetectionCount: return (value as number).toString()
    case ACTIVITY_OVERVIEW_MAP_KEYS.detectionFrequency: return (value as number).toFixed(3)
    default: return (value as boolean) ? 'Detected' : 'Not detected'
  }
}

export const generateDetectionHtmlPopup = (datum: MapSiteData, dataKey: string): string => {
  const value = datum.distinctSpecies[dataKey]
  return `<span>${getFormattedValue(value, dataKey)}</span>`
}
