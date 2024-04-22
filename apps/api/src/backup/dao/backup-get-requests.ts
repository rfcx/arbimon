import { Op } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type Backup, type BackupType } from '@rfcx-bio/common/dao/types/backup'

import { getSequelize } from '~/db'

const DEFAULT_TIMEFRAME = '7d'

/**
 * Retrieves backup requests for a given entity and id
 *
 * @param entity
 * @param entityId
 * @param requestedBy
 * @param options
 */
export const getBackupRequests = async (entity: BackupType, entityId: number, requestedBy: number, options?: { limit: number, offset: number }): Promise<Backup[] | []> => {
    const { limit = 3, offset = 0 } = options ?? {}
    const sequelize = getSequelize()
    const { Backup } = ModelRepository.getInstance(sequelize)

    const backupRequests = await Backup.findAll({
        where: {
            entity,
            entity_id: entityId,
            requested_by: requestedBy
        },
        limit,
        offset,
        attributes: ['requested_at', 'url', 'status', 'expires_at'],
        order: [['requested_at', 'DESC']],
        raw: true
    })

    return backupRequests ?? []
}

/**
 * Gets a single request by filter criteria
 *
 * @param entity
 * @param entityId
 * @param requestedBy
 * @param timeframe
 */
export const getRequestWithinTimeframe = async (entity: BackupType, entityId: number, requestedBy: number, timeframe: string = DEFAULT_TIMEFRAME): Promise<Backup | null> => {
    const sequelize = getSequelize()
    const { Backup } = ModelRepository.getInstance(sequelize)

    return await Backup.findOne({
        where: {
            entity,
            entity_id: entityId,
            requested_by: requestedBy,
            requested_at: {
                [Op.gte]: sequelize.literal(`NOW() - INTERVAL '${timeframe}'`)
            }
        }
    })
}
