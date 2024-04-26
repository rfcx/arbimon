import { type AxiosInstance } from 'axios'

import { type Backup, type BackupType } from '../../dao/types/backup'
import { backupsRoute } from './backups'

export interface CreateBackupBody {
    entity: BackupType
    entityId: number
}

export interface CreateBackupResponse {
    success: boolean
    backup: Backup | undefined
}

export const apiBioPostBackup = async (apiClient: AxiosInstance, options: CreateBackupBody): Promise<CreateBackupResponse> => {
    return await apiClient.post(backupsRoute, options)
}
