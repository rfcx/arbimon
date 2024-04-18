import { type BackupType } from '@/dao/types/backup'

export const backupsRoute = '/backup/:entity/:entityId'

export interface BackupRequestParams {
    entity: BackupType
    entityId: number
}
