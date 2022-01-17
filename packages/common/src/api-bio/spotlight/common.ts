export type TimeBucket = 'hourOfDay' | 'dayOfWeek' | 'monthOfYear' | 'dateSeries'

export type ActivitySpotlightDataByTime = Record<TimeBucket, ActivitySpotlightDataByTimeBucket>

export interface ActivitySpotlightDataByTimeBucket {
  detection: Record<number, number>
  detectionFrequency: Record<number, number>
}

export interface ActivitySpotlightDataBySite {
  [siteId: string]: {
    siteId: string
    siteName: string
    latitude: number
    longitude: number
    siteDetectionCount: number
    siteDetectionFrequency: number
    siteOccupied: boolean
  }
}

export interface ActivitySpotlightDataByExport {
  hour: ActivitySpotlightDataByExportBucket
  month: ActivitySpotlightDataByExportBucket
  year: ActivitySpotlightDataByExportBucket
  sites: ActivitySpotlightDataBySite
}

export interface ActivitySpotlightDataByExportBucket {
  detection: Record<number|string, number>
  detectionFrequency: Record<number|string, number>
}
