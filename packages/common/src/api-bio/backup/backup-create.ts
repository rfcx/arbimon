import { type Backup, type BackupType } from '@/dao/types/backup'

export interface CreateBackupBody {
    entity: BackupType
    entityId: number
}

export type CreateBackupResponse = Backup
