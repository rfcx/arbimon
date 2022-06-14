import { AxiosInstance } from 'axios'

import { apiCoreGetClassifierJobAll, ClassifierJobAll, ClassifierJobAllParams } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-all'
import { apiCorePostClassifierJobCreate, ClassifierJobCreateParams, ClassifierJobCreateResponse } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-create'

export const classifierJobAllGet = async (apiClient: AxiosInstance, params?: ClassifierJobAllParams): Promise<ClassifierJobAll> => {
  const result = await apiCoreGetClassifierJobAll(apiClient, params)
  return result
}

export const classifierJobCreate = async (apiClient: AxiosInstance, payload: ClassifierJobCreateParams): Promise<ClassifierJobCreateResponse> => {
  const result = await apiCorePostClassifierJobCreate(apiClient, payload)
  return result
}
