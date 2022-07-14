import { AxiosInstance } from 'axios'
import { useMutation, UseMutationReturnType } from 'vue-query'

import { apiCorePostClassifierJobCreate, ClassifierJobCreateConfiguration, ClassifierJobCreateConfigurationParams, ClassifierJobCreateResponse } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-create'

// Convert front params to api params
export const convertClassifierCreateJobPayload = (jobConfiguration: ClassifierJobCreateConfiguration): ClassifierJobCreateConfigurationParams => {
  const { classifierId, projectIdCore, queryStreams, queryStart, queryEnd, queryHour } = jobConfiguration
  return {
    classifier_id: classifierId,
    project_id: projectIdCore ?? '',
    query_streams: queryStreams ?? undefined,
    query_start: queryStart ?? undefined,
    query_end: queryEnd ?? undefined,
    query_hours: queryHour ?? undefined
  }
}

export const usePostClassifierJob = (apiClient: AxiosInstance): UseMutationReturnType<ClassifierJobCreateResponse, unknown, ClassifierJobCreateConfiguration, unknown> => {
  return useMutation(
    ['post-classifier-job'],
    async (payload: ClassifierJobCreateConfiguration) => await apiCorePostClassifierJobCreate(apiClient, convertClassifierCreateJobPayload(payload))
  )
}
