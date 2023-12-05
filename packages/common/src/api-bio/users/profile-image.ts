import { type AxiosInstance } from 'axios'

// Route
export const userProfileImageRoute = '/profile-image'

// Service
export const apiGetProfileImage = async (apiClient: AxiosInstance): Promise<Blob> => {
  const response = await apiClient.get<Blob>(userProfileImageRoute, { responseType: 'blob' })
  return response.data
}

/**
 * API connector to upload image to S3. Please pass in FormData into the second argument of the function.
 *
 * Example:
 * ```
 * const form = new FormData()
 * form.append('image', imageFileAsBlobType)
 * ```
 */
export const apiPatchProfileImage = async (apiClient: AxiosInstance, imageForm: FormData): Promise<void> => {
  await apiClient.patch(userProfileImageRoute, imageForm)
}
