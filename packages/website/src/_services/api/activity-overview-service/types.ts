import { DatasetDefinition } from '~/api'
import { TimeBucket } from '~/api/species-richness-service'
import { ApiHourlySpeciesSummary } from '~/api-helpers/mock'

export interface DetectionGroupedBySiteAndTaxon {
  [taxon: string]: {
    [siteId: string]: ApiHourlySpeciesSummary[]
  }
}

export interface DetectionGroupByDetectionKey {
  [taxonClassNameOrSiteId: string]: ApiHourlySpeciesSummary[]
}

export interface ActivityOverviewData extends DatasetDefinition {
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
  speciesName: string
  taxonomyClass: string
  detectionCount: number
  detectionFrequency: number
  occupiedSites: number
  occupancyNaive: number
}
