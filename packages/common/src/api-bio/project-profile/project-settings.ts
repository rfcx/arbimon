import { type AxiosInstance } from 'axios'

import { apiGetOrUndefined } from '@rfcx-bio/utils/api'

import { type AttributeTypes, attributes } from '../../dao/type-helpers'
import { type LocationProjectProfile, type Project, type ProjectVersion } from '../../dao/types'
import { type ApiStack, type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'
import { type DashboardMetricsResponse } from '../dashboard/dashboard-metrics'

// Request types
export type ProjectProfileParams = ProjectRouteParamsSerialized
export interface ProjectProfileQuery {
  fields?: ProjectInfoFieldType[]
}

// Response types
export type ProjectProfileUpdateBody = {
  summary?: string
  objectives?: string[]
  dateStart?: string | null
  dateEnd?: string | null
} & { name: string } // name is required as part of checking for permission in Core

type ProjectMetrics = Pick<DashboardMetricsResponse, 'totalSites' | 'totalSpecies' | 'threatenedSpecies' | 'totalDetections' | 'totalRecordings'>

export type ProjectProfileUpdateResponse = Pick<LocationProjectProfile, 'summary' | 'objectives' | 'dateStart' | 'dateEnd'>

export type ProjectInfoResponse = Pick<Project, 'name'>
  & Pick<LocationProjectProfile, 'summary' | 'objectives' | 'dateStart' | 'dateEnd'>
  & Pick<ProjectVersion, 'isPublished'>
  & {
  // TODO: add - stakeholder: string
  countryCodes?: string[]
  readme?: string
  keyResult?: string
  metrics?: ProjectMetrics
  image?: string
  richnessByTaxon?: ApiStack
}

export type ProjectSettingsResponse = Omit<ProjectInfoResponse, 'readme' | 'keyResults' | 'metrics' | 'image'>

export const ATTRIBUTES_PROJECT_INFO_RESPONSE = attributes<ProjectInfoResponse>()({
})

export type ProjectInfoFieldType = AttributeTypes< ProjectInfoResponse, typeof ATTRIBUTES_PROJECT_INFO_RESPONSE>

// Route
export const projectDataRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}`

// Service
export const apiBioGetProjectInfoData = async (apiClient: AxiosInstance, projectId: number, fields: ProjectInfoFieldType[]): Promise<ProjectInfoResponse | undefined> => {
  const url = `/projects/${projectId}/profile`
  const params = {
    fields: fields.join(',')
  }
  return await apiGetOrUndefined(apiClient, url, { params })
}

export const apiBioGetProjectSettingsData = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectSettingsResponse | undefined> =>
  await apiBioGetProjectInfoData(apiClient, projectId, ['countryCodes'])

export const apiBioUpdateProjectSettingsData = async (apiClient: AxiosInstance, projectId: number, settings: ProjectProfileUpdateBody): Promise<ProjectSettingsResponse> =>
  await apiClient.patch(`/projects/${projectId}/profile`, settings)
