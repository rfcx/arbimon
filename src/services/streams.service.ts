import * as Endpoints from '@/api/endpoints'
import { StreamModels } from '@/models'
import ApiClient from './api.service'

// Api calling example
export async function getStreams (): Promise<StreamModels.Stream[]> {
  const { method, url } = Endpoints.getStreams

  try {
    const resp = await ApiClient.request({
      url,
      method
    })
    return resp
  } catch (e) {
    return await Promise.reject(e)
  }
}
