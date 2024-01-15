import { type AxiosInstance } from 'axios'

export interface UpdateProjectPublishStatusRequestBody {
  status: boolean
}

export interface UpdateProjectPublishStatusRequestParams {
  projectId: string
}

export const updateProjectPublishStatusRoute = '/projects/:projectId/publish-status'

export const apiBioUpdateProjectPublishStatus = async (apiClient: AxiosInstance, projectId: number, status: boolean): Promise<void> => {
  await apiClient.patch(updateProjectPublishStatusRoute.replace(':projectId', projectId.toString()), { status })
}
