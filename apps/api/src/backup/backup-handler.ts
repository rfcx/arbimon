import type {
    CreateBackupBody,
    CreateBackupResponse
} from '@rfcx-bio/common/api-bio/backup/backup-create'
import { type GetBackupRequestsQuery, type GetBackupRequestsResponse } from '@rfcx-bio/common/api-bio/backup/backup-get'
import { type Backup } from '@rfcx-bio/common/dao/types/backup'

import { createBackupRequest } from '@/backup/dao/backup-create-dao'
import { getBackupRequests } from '@/backup/dao/backup-get-requests'
import { ALLOWED_BACKUP_TYPES, BackupEntityGetters } from '@/backup/types'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioMissingPathParamError, BioPublicError } from '~/errors'

export const createBackupRequestHandler: Handler<CreateBackupResponse, unknown, unknown, CreateBackupBody> = async (req, res): Promise<Backup | undefined> => {
    // Validate entity type and id
    const { entity: entityType, entityId } = req.body
    const { userId } = req

    if (entityType === undefined) {
        throw BioMissingPathParamError('entity')
    }

    if (!(entityType in ALLOWED_BACKUP_TYPES)) {
        throw BioInvalidPathParamError({ entity: entityType })
    }

    if (entityId === undefined) {
        throw BioMissingPathParamError('entityId')
    }

    if (userId === undefined) {
        throw new BioPublicError('userId is required for creating a backup request', 500)
    }

    // Check if backup entity exists
    const entityGetter = BackupEntityGetters[entityType]
    const entity = await entityGetter(entityId)

    if (entity === undefined || entity === null) {
        throw new BioPublicError(`${String(entityType)} with id ${Number(entityId)} not found`, 404)
    }

    // Create and return backup request
    return await createBackupRequest(entityType, entityId, userId)
}

export const getBackupRequestsHandler: Handler<GetBackupRequestsResponse, unknown, GetBackupRequestsQuery, unknown> = async (req, res) => {
    // Validate entity information
    const { entity: entityType, entityId, limit = 3, offset = 0 } = req.query
    const { userId } = req

    if (entityType === undefined) {
        throw BioMissingPathParamError('entity')
    }

    if (!(entityType in ALLOWED_BACKUP_TYPES)) {
        throw BioInvalidPathParamError({ entity: entityType })
    }

    if (entityId === undefined) {
        throw BioMissingPathParamError('entityId')
    }

    if (userId === undefined) {
        throw new BioPublicError('userId is required for retrieving backup requests', 500)
    }

    // Check if backup entity exists
    const entityGetter = BackupEntityGetters[entityType]
    const entity = await entityGetter(entityId)

    if (entity === undefined || entity === null) {
        throw new BioPublicError(`${String(entityType)} with id ${Number(entityId)} not found`, 404)
    }

    // Get backup requests
    return await getBackupRequests(entityType, entityId, userId, { limit, offset })
}
