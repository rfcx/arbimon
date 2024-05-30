import { type UseMutationReturnType, type UseQueryReturnType, useMutation, useQuery } from '@tanstack/vue-query'
import { type AxiosInstance } from 'axios'

import { type CreateBackupBody, type CreateBackupResponse, apiBioPostBackup } from '@rfcx-bio/common/api-bio/backup/backup-create'
import { apiBioGetBackupRequests } from '@rfcx-bio/common/api-bio/backup/backup-get'
import { type Backup } from '@rfcx-bio/node-common/dao/types/backup'

export const useGetBackup = (apiClient: AxiosInstance, projectId: number): UseQueryReturnType<Backup[], Error> => {
  return useQuery({
    queryKey: ['get-backup'],
    queryFn: async () => await apiBioGetBackupRequests(apiClient, { entity: 'project', entityId: projectId, limit: 3, offset: 0 })
  })
}

export const useCreateBackup = (apiClient: AxiosInstance): UseMutationReturnType<CreateBackupResponse, Error, CreateBackupBody, unknown> => {
  return useMutation({
    mutationKey: ['create-backup'],
    mutationFn: async (payload: CreateBackupBody) => await apiBioPostBackup(apiClient, payload)
  })
}
