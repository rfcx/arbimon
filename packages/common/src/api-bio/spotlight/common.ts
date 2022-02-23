export type TimeBucket = 'hourOfDay' | 'dayOfWeek' | 'monthOfYear' | 'dateSeries'

export type SpotlightDataByTime = Record<TimeBucket, SpotlightDetectionDataByTime>

export interface SpotlightDetectionDataBySite {
  [siteId: string]: {
    siteId: number
    siteName: string
    latitude: number
    longitude: number
    siteDetectionCount: number
    siteDetectionFrequency: number
    siteOccupied: boolean
  }
}

export interface SpotlightDetectionDataByTime<T extends string | number = number> {
  detection: Record<T, number>
  detectionFrequency: Record<T, number>
}

export interface SpotlightExportData {
  hour: SpotlightDetectionDataByTime
  month: SpotlightDetectionDataByTime
  year: SpotlightDetectionDataByTime
  sites: SpotlightDetectionDataBySite
}
