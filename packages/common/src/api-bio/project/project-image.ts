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
 *
 * For the location property. Send anything that gets returned from `Location` header of project create api.
 */
export const apiBioUpdateProjectImage = async (apiClient: AxiosInstance, location: string, form: FormData): Promise<void> => {
  await apiClient.patch(`${location}/project-profile-image`, form)
}
