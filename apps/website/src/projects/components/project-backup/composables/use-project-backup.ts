import { type UseQueryReturnType, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type GetBackupRequestsResponse, apiBioGetBackupRequests } from '@rfcx-bio/common/api-bio/backup/backup-get'

export const useGetBackup = (apiClient: AxiosInstance, projectId: number): UseQueryReturnType<GetBackupRequestsResponse, Error> => {
  return useQuery({
    queryKey: ['get-backup'],
    queryFn: async () => await apiBioGetBackupRequests(apiClient, { entity: 'project', entityId: projectId })
  })
}
