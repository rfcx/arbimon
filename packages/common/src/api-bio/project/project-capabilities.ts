import { type AxiosInstance } from 'axios'

import { PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

/**
 * Self-serve project capabilities (2026-07-12): whether the CURRENT user can
 * delete / request a backup of the project. Super users can always; regular
 * owners/admins can when the project is small enough (recording-count
 * thresholds, operator-adjustable via env on bio-api).
 */
export interface ProjectCapabilitiesResponse {
  canDelete: boolean
  canBackup: boolean
  recordingCount: number | null
  deleteMaxRecordings: number
  backupMaxRecordings: number
}

export const projectCapabilitiesRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/capabilities`

export const apiBioGetProjectCapabilities = async (apiClient: AxiosInstance, projectId: number): Promise<ProjectCapabilitiesResponse> => {
  return await apiClient.get<ProjectCapabilitiesResponse>(`/projects/${projectId}/capabilities`).then(res => res.data)
}
