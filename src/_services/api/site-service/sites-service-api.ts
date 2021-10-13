import { Site } from '~/api/types'
import ApiClient from '~/api-helpers/rest/api-service'
import { endpointSites } from '../../api-helpers/rest'

export const getSites = async (): Promise<Site[]> => {
  const { method, url } = endpointSites

  try {
    const resp = await ApiClient.request<Site[]>({
      url,
      method
    })
    return resp
  } catch (e) {
    return await Promise.reject(e)
  }
}
