import { type AxiosInstance } from 'axios'

import { type Backup, type BackupType } from '@/dao/types/backup'
import { backupsRoute } from './backups'

export interface GetBackupRequestsQuery {
    entity: BackupType
    entityId: number
    limit?: number
    offset?: number
}

export type GetBackupRequestsResponse = Backup[]

export const apiBioGetBackupRequests = async (apiClient: AxiosInstance, query: GetBackupRequestsQuery): Promise<GetBackupRequestsResponse> => {
    const { entity, entityId, limit, offset } = query
    return await apiClient.get(backupsRoute, { params: { entity, entityId, limit, offset } })
}
