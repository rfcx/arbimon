import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type ProjectMembersResponse } from '@rfcx-bio/common/api-bio/project/project-members'
import { apiBioSuperGetProjectMembers } from '@rfcx-bio/common/api-bio/super/projects'

import { type Error } from './error'

export const useGetSuperProjectMembers = (apiClient: AxiosInstance, projectId: number): UseQueryReturnType<ProjectMembersResponse, Error> => {
  return useQuery({
    queryKey: ['get-project-members', projectId],
    queryFn: async () => await apiBioSuperGetProjectMembers(apiClient, projectId),
    retry: 0,
    staleTime: 1000
  })
}
