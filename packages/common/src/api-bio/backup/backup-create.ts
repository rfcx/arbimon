import { type Backup, type BackupType } from '@/dao/types/backup'

export interface CreateBackupBody {
    entity: BackupType
    entityId: number
}

export interface CreateBackupResponse {
    success: boolean
    backup: Backup | undefined
}
