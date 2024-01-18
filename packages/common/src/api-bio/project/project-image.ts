import { type AxiosInstance } from 'axios'

import { type ProjectRouteParamsSerialized, PROJECT_SPECIFIC_ROUTE_PREFIX } from '../_helpers'

// Request types
export type PatchProjectProjectImageParams = ProjectRouteParamsSerialized

// Route
export const projectProfileImageRoute = `${PROJECT_SPECIFIC_ROUTE_PREFIX}/project-profile-image`

// Service
/**
 * API connector to upload project profile image to S3. Please pass in FormData into the second argument of the function.
 *
 * Example:
 * ```
 * const form = new FormData()
 * form.append('image', imageFileAsBlobType)
 * ```
 */
export const apiBioUpdateProjectImage = async (apiClient: AxiosInstance, projectId: number, form: FormData): Promise<void> => {
  await apiClient.patch(projectProfileImageRoute.replace(':projectId', projectId.toString()), form)
}
