import { ProjectSpecificRouteParams } from '../common/project-specific-route'
import { DataByTime } from '../common/time-bucket'

// Request
export type ActivityDatasetParams = ProjectSpecificRouteParams

export const activityDatasetRoute = '/projects/:projectId/activity'

export const activityDatasetGeneratedUrl = (params: ActivityDatasetParams): string => `/projects/${params.projectId}/activity`

// Response
export interface ActivityDatasetResponse {
  isLocationRedacted: boolean
  detectionsBySite: ActivityOverviewDetectionDataBySite
  detectionsBySpecies: ActivityOverviewDataBySpecies[]
  detectionsByTimeHour: ActivityOverviewDetectionDataByTime
  detectionsByTimeDay: ActivityOverviewDetectionDataByTime
  detectionsByTimeMonth: ActivityOverviewDetectionDataByTime
  detectionsByTimeDate: ActivityOverviewDetectionDataByTime
}

export interface ActivityOverviewDetectionDataBySite {
  [siteId: number]: {
    siteId: number
    siteName: string
    latitude: number
    longitude: number
    detection: number
    detectionFrequency: number
    occupancy: boolean
  }
}

export interface ActivityOverviewDetectionDataByTime {
  detection: Record<number, number>
  detectionFrequency: Record<number, number>
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

// ----- Not related to api return item ----
// ? Moving to somewhere
export type ActivityOverviewDataByTime = DataByTime<ActivityOverviewDetectionDataByTime>
