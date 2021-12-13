import { MockHourlyDetectionSummary } from '@rfcx-bio/common/mock-data'

import { TimeBucket } from '~/api/species-richness-service'
import { DatasetParameters } from '~/filters'

export interface DetectionGroupedBySiteAndTaxon {
  [taxon: string]: {
    [siteId: string]: MockHourlyDetectionSummary[]
  }
}

export interface DetectionGroupByDetectionKey {
  [taxonNameOrSiteId: string]: MockHourlyDetectionSummary[]
}

export interface ActivityOverviewData extends DatasetParameters {
  overviewBySite: ActicvityOverviewDataBySite
  overviewByTime: ActivityOverviewDataByTime[]
  overviewBySpecies: ActivityOverviewDataBySpecies[]
}

export interface ActicvityOverviewDataBySite {
  [taxon: string]: {
    [siteId: string]: {
      siteId: string
      siteName: string
      latitude: number
      longitude: number
      detection: number
      detectionFrequency: number
      occupancy: boolean
    }
  }
}

export type ActivityOverviewDataByTime = Record<TimeBucket, ActivityOverviewDataByTimeBucket>

export interface ActivityOverviewDataByTimeBucket {
  detection: Record<number, number>
  detectionFrequency: Record<number, number>
  occupancy: Record<number, number>
}

export const ACTIVITY_OVERVIEW_TIME_KEYS: Record<string, keyof ActivityOverviewDataByTimeBucket> = {
  detection: 'detection',
  detectionFrequency: 'detectionFrequency',
  occupancy: 'occupancy'
}

export interface ActivityOverviewDataBySpecies {
  scientificName: string
  commonName: string
  taxon: string
  detectionCount: number
  detectionFrequency: number
  occupiedSites: number
  occupancyNaive: number
}
