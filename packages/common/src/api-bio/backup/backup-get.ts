import { type Backup, type BackupType } from '@/dao/types/backup'

export interface GetBackupRequestsQuery {
    entity: BackupType
    entityId: number
    limit?: number
    offset?: number
}

export type GetBackupRequestsResponse = Backup[]
