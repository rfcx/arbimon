import { type AxiosInstance } from 'axios'

import { type Project } from '../../dao/types'

export interface ProjectUploadLimitSummaryParams {
  idCore: string
}

export interface ProjectUploadLimitSummaryResponse {
  idCore: string
  slug: string
  projectType: NonNullable<Project['projectType']>
  entitlementState: Project['entitlementState']
  viewOnlyEffective: Project['viewOnlyEffective']
  recordingMinutesCount: number
  recordingMinutesLimit: number | null
  remainingRecordingMinutes: number | null
}

export const projectUploadLimitSummaryRoute = '/projects-core/:idCore/upload-limit-summary'

export const apiBioGetProjectUploadLimitSummary = async (apiClient: AxiosInstance, idCore: string): Promise<ProjectUploadLimitSummaryResponse> => {
  return await apiClient.get<ProjectUploadLimitSummaryResponse>(projectUploadLimitSummaryRoute.replace(':idCore', idCore)).then(res => res.data)
}
