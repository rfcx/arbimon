import { type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type ClassifierJobCreateConfiguration, type ClassifierJobCreateConfigurationParams, type ClassifierJobCreateResponse, apiCorePostClassifierJobCreate } from '@rfcx-bio/common/api-core/classifier-job/classifier-job-create'

// Convert front params to api params
export const convertClassifierCreateJobPayload = (jobConfiguration: ClassifierJobCreateConfiguration): ClassifierJobCreateConfigurationParams => {
  const { classifierId, projectIdCore, queryStreams, queryStart, queryEnd, queryHours } = jobConfiguration
  return {
    classifier_id: classifierId,
    project_id: projectIdCore ?? '',
    query_streams: queryStreams ?? undefined,
    query_start: queryStart ?? undefined,
    query_end: queryEnd ?? undefined,
    query_hours: queryHours ?? undefined
  }
}

export const usePostClassifierJob = (apiClient: AxiosInstance): UseMutationReturnType<ClassifierJobCreateResponse, unknown, ClassifierJobCreateConfiguration, unknown> => {
  return useMutation({
    mutationKey: ['post-classifier-job'],
    mutationFn: async (payload: ClassifierJobCreateConfiguration) => await apiCorePostClassifierJobCreate(apiClient, convertClassifierCreateJobPayload(payload))
  })
}
