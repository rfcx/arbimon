import type { CreateBackupBody, CreateBackupResponse } from '@rfcx-bio/common/api-bio/backup/backup-create'
import { type GetBackupRequestsQuery, type GetBackupRequestsResponse } from '@rfcx-bio/common/api-bio/backup/backup-get'
import { type Backup } from '@rfcx-bio/common/dao/types/backup'

import { createBackupRequest } from '@/backup/dao/backup-create-dao'
import { getBackupRequests, getRequestWithinTimeframe } from '@/backup/dao/backup-get-requests'
import { type Handler } from '~/api-helpers/types'
import { BioPublicError } from '~/errors'

export const createBackupRequestHandler: Handler<CreateBackupResponse, unknown, unknown, CreateBackupBody> = async (req, res) => {
    const { entity: entityType, entityId } = req.body
    const { userId } = req

    if (userId === undefined) {
        throw new BioPublicError('userId is required for creating a backup request', 500)
    }

    const existingRequest = await getRequestWithinTimeframe(entityType, entityId)

    if (existingRequest !== null) {
        throw new BioPublicError(`A backup request for this ${entityType} already exists`, 500)
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
    const { entity: entityType, entityId, limit = 3, offset = 0 } = req.query
    const { userId } = req

    if (userId === undefined) {
        throw new BioPublicError('userId is required for retrieving backup requests', 500)
    }

    // Get backup requests
    const requests: Backup[] = await getBackupRequests(entityType, entityId, { limit, offset })

    if (requests.length) {
        res.statusCode = 200
    }

    return requests
}
