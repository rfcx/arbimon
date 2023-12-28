import { type AxiosInstance } from 'axios'

export const projectProfileImageRoute = '/projects/:projectId/project-profile-image'

export interface PatchProjectProjectImageParams {
  projectId: string
}

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
  await apiClient.patch(`projects/${projectId}/project-profile-image`, form)
}
