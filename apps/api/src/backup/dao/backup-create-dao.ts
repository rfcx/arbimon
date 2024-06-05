import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type Backup, type BackupType, BackupStatus } from '@rfcx-bio/node-common/dao/types/backup'

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
        entityId,
        requestedBy: userId,
        requestedAt: new Date(),
        status: BackupStatus.REQUESTED
    }

    return await Backup.create(backup)
}
