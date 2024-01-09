import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'
import { type ComputedRef } from 'vue'

import { type GetProjectMembersResponse, apiBioGetProjectMembers } from '@rfcx-bio/common/api-bio/project/project-members'

export const useGetProjectMembers = (apiClient: AxiosInstance, projectId: ComputedRef<number | undefined>): UseQueryReturnType<GetProjectMembersResponse, unknown> => {
  return useQuery({
    queryKey: ['get-project-members', projectId],
    queryFn: async () => await apiBioGetProjectMembers(apiClient, projectId?.value ?? -1)
  })
}
