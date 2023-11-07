import { type AxiosInstance } from 'axios'

export interface UpdateInsightsPublishStatusRequestBody {
  status: boolean
}

export interface UpdateInsightsPublishStatusRequestParams {
  projectId: string
}

export const updateInsightsPublishStatusRoute = '/projects/:projectId/insights-publish-status'

export const apiBioUpdateInsightsPublishStatus = async (apiClient: AxiosInstance, projectId: number, status: boolean): Promise<void> => {
  await apiClient.patch(`/projects/${projectId}/insights-publish-status`, { status })
}

export type GetInsightsPublishStatusRequestParams = UpdateInsightsPublishStatusRequestParams
export type GetInsightsPublishStatusResponseBody = UpdateInsightsPublishStatusRequestBody

export const getInsightsPublishStatusRoute = updateInsightsPublishStatusRoute

export const apiBioGetInsightsPublishStatus = async (apiClient: AxiosInstance, projectId: number): Promise<GetInsightsPublishStatusResponseBody> => {
  const response = await apiClient.get<GetInsightsPublishStatusResponseBody>(`/projects/${projectId}/insights-publish-status`)
  return response.data
}
