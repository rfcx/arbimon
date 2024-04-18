import { type BackupType } from '@/api-bio/backup/backups'

export interface GetBackupRequestsRequest {
    type: BackupType
    entityId: number
}

export interface GetBackupRequestsResponse {
    requests: any
}
