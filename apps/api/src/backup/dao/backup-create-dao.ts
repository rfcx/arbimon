import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type Backup, type BackupType, BackupStatus } from '@rfcx-bio/common/dao/types/backup'

import { getSequelize } from '~/db'

/**
 * Stores a backup request in db
 *
 * @param entity - type of entity to be backed up (e.g. project)
 * @param entityId - id of entity to be backed up
 * @param userId - user that requested the backup
 */
export const createBackupRequest = async (entity: BackupType, entityId: number, userId: number): Promise<Backup | undefined> => {
    const sequelize = getSequelize()
    const { Backup } = ModelRepository.getInstance(sequelize)

    const backup: Omit<Backup, 'id' | 'expires_at' | 'size' | 'url'> = {
        entity,
        entity_id: entityId,
        requested_by: userId,
        requested_at: new Date(),
        status: BackupStatus.REQUESTED
    }

    return Backup.create(backup)
}
