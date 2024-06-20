import { Op } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type Backup, type BackupType } from '@rfcx-bio/node-common/dao/types/backup'

import { getSequelize } from '~/db'
import { env } from '~/env'

const { BACKUP_TIMEFRAME_LIMIT } = env

const DEFAULT_TIMEFRAME = '7d'

/**
 * Retrieves backup requests for a given entity and id
 *
 * @param entity
 * @param entityId
 * @param requestedBy
 * @param options
 */
export const getBackupRequests = async (entity: BackupType, entityId: number, options?: { limit: number, offset: number }): Promise<Backup[] | []> => {
    const { limit = 3, offset = 0 } = options ?? {}
    const sequelize = getSequelize()
    const { Backup } = ModelRepository.getInstance(sequelize)

    const backupRequests = await Backup.findAll({
        where: {
            entity,
            entityId
        },
        limit,
        offset,
        attributes: ['requestedAt', 'url', 'status', 'expiresAt'],
        order: [['requestedAt', 'DESC']],
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
export const getRequestWithinTimeframe = async (
    entity: BackupType,
    entityId: number,
    timeframe: string = BACKUP_TIMEFRAME_LIMIT ?? DEFAULT_TIMEFRAME
): Promise<Backup | null> => {
    const sequelize = getSequelize()
    const { Backup } = ModelRepository.getInstance(sequelize)

    return await Backup.findOne({
        where: {
            entity,
            entityId,
            requestedAt: {
                [Op.gte]: sequelize.literal(`NOW() - INTERVAL '${timeframe}'`)
            }
        }
    })
}
