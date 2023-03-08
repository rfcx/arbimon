import { ACTIVITY_OVERVIEW_MAP_KEYS } from '@/activity-overview/functions'
import { type MapSiteData } from '~/maps/types'

const getFormattedValue = (value: number | boolean, dataKey: string): string => {
  switch (dataKey) {
    case ACTIVITY_OVERVIEW_MAP_KEYS.count: return (value as number).toString()
    case ACTIVITY_OVERVIEW_MAP_KEYS.detectionFrequency: return (value as number).toFixed(3)
    default: return (value as boolean) ? 'Detected' : 'Not detected'
  }
}

export const generateDetectionHtmlPopup = (datum: MapSiteData, dataKey: string): string => {
  const value = datum.values[dataKey]
  return `<span>${getFormattedValue(value, dataKey)}</span>`
}
