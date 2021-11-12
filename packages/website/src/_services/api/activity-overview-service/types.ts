import { DatasetDefinition } from '~/api'
import { ApiHourlySpeciesSummary } from '~/api-helpers/mock'

export interface DetectionGroupedBySiteAndTaxon {
  [taxon: string]: {
    [siteId: string]: ApiHourlySpeciesSummary[]
  }
}

export interface DetectionGroupByTaxonClass {
  [taxon: string]: ApiHourlySpeciesSummary[]
}

export interface ActivityOverviewData extends DatasetDefinition {
  overviewBySite: ActicvityOverviewDataBySite
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
    }
  }
}
