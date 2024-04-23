import type {
    CreateBackupBody,
    CreateBackupResponse
} from '@rfcx-bio/common/api-bio/backup/backup-create'
import { type GetBackupRequestsQuery, type GetBackupRequestsResponse } from '@rfcx-bio/common/api-bio/backup/backup-get'

import { createBackupRequest } from '@/backup/dao/backup-create-dao'
import { getBackupRequests, getRequestWithinTimeframe } from '@/backup/dao/backup-get-requests'
import { ALLOWED_BACKUP_TYPES, BackupEntityGetters } from '@/backup/types'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioMissingPathParamError, BioPublicError } from '~/errors'

export const createBackupRequestHandler: Handler<CreateBackupResponse, unknown, unknown, CreateBackupBody> = async (req, res) => {
    // Validate entity type and id
    const { entity: entityType, entityId } = req.body
    const { userId } = req

    if (entityType === undefined) {
        throw BioMissingPathParamError('entity')
    }

    if (!(ALLOWED_BACKUP_TYPES.includes(entityType))) {
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

    const existingRequest = await getRequestWithinTimeframe(entityType, entityId, userId)

    if (existingRequest !== null) {
        throw new BioPublicError(`A backup request for this ${String(entityType)} already exists`, 500)
    }

    // Create and return backup request
    const backup = await createBackupRequest(entityType, entityId, userId)
    const success = backup !== undefined

    if (success) {
        res.statusCode = 201
    }

    return {
        backup,
        success
    }
}

export const getBackupRequestsHandler: Handler<GetBackupRequestsResponse, unknown, GetBackupRequestsQuery, unknown> = async (req, res) => {
    // Validate entity information
    const { entity: entityType, entityId, limit = 3, offset = 0 } = req.query
    const { userId } = req

    if (entityType === undefined) {
        throw BioMissingPathParamError('entity')
    }

    if (!(ALLOWED_BACKUP_TYPES.includes(entityType))) {
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
    const requests = await getBackupRequests(entityType, entityId, userId, { limit, offset })

    if (requests.length) {
        res.statusCode = 200
    }

    return requests
}
