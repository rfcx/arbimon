import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type Ref } from 'vue'

import { apiBioSuperGetProjects } from '@rfcx-bio/common/api-bio/super/projects'
import { type LocationProjectTypes } from '@rfcx-bio/common/dao/types'

interface Error {
  message: string
  name: string
  response?: {
    status: number
    statusText: string
  }
}

export const useGetSuperProjects = (apiClient: AxiosInstance, options: { keyword?: Ref<string>, limit?: Ref<number>, offset?: Ref<number> }): UseQueryReturnType<Array<LocationProjectTypes['light']>, Error> => {
  return useQuery({
    queryKey: ['get-projects', options.keyword, options.limit, options.offset],
    queryFn: async () => await apiBioSuperGetProjects(apiClient, { keyword: options.keyword?.value, limit: options.limit?.value, offset: options.offset?.value }),
    retry: 0,
    staleTime: 1000
  })
}
