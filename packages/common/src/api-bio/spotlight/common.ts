export type TimeBucket = 'hourOfDay' | 'dayOfWeek' | 'monthOfYear' | 'dateSeries'

export type ActivitySpotlightDataByTime = Record<TimeBucket, ActivitySpotlightDataByTimeBucket>

export interface ActivitySpotlightDataByTimeBucket {
  detection: Record<number, number>
  detectionFrequency: Record<number, number>
}

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

export interface ActivitySpotlightDataByExport {
  hour: ActivitySpotlightDataByExportBucket
  month: ActivitySpotlightDataByExportBucket
  year: ActivitySpotlightDataByExportBucket
}

export interface ActivitySpotlightDataByExportBucket {
  detection: Record<number|string, number>
  detectionFrequency: Record<number|string, number>
}
