import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type Backup, type BackupType } from '@rfcx-bio/common/dao/types/backup'

import { getSequelize } from '~/db'

/**
 * Retrieves backup requests for a given entity and id
 *
 * @param entity
 * @param entityId
 * @param requestedBy
 * @param options
 */
export const getBackupRequests = async (entity: BackupType, entityId: number, requestedBy: number, options?: { limit: number, offset: number }): Promise<Backup[]> => {
    const { limit = 3, offset = 0 } = options ?? {}
    const sequelize = getSequelize()
    const { Backup } = ModelRepository.getInstance(sequelize)

    return Backup.findAll({
        where: {
            entity,
            entityId,
            requestedBy
        },
        limit,
        offset,
        attributes: ['requestedAt', 'url', 'status', 'expiresAt'],
        order: [['requestedAt', 'DESC']],
        raw: true
    })
}
