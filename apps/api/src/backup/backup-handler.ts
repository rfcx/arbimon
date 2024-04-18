import type {
    CreateBackupRequest,
    CreateBackupResponse
} from '@rfcx-bio/common/api-bio/backup/backup-create'
import { type GetBackupRequestsRequest, type GetBackupRequestsResponse } from '@rfcx-bio/common/api-bio/backup/backup-get'
import { type BackupRequestParams } from '@rfcx-bio/common/api-bio/backup/backups'

import { ALLOWED_BACKUP_TYPES, BackupEntityGetters } from '@/backup/types'
import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioMissingPathParamError, BioPublicError } from '~/errors'

export const createBackupRequestHandler: Handler<CreateBackupRequest, BackupRequestParams, unknown, CreateBackupResponse> = async (req, res) => {
    // Validate entity type and id
    const { entity: entityType, entityId } = req.params

    if (entityType === undefined) {
        throw BioMissingPathParamError('entity')
    }

    if (!(entityType in ALLOWED_BACKUP_TYPES)) {
        throw BioInvalidPathParamError({ entity: entityType })
    }

    if (entityId === undefined) {
        throw BioMissingPathParamError('entityId')
    }

    // Check if backup entity exists
    const entityGetter = BackupEntityGetters[entityType]
    const entity = await entityGetter(entityId)

    if (entity === undefined || entity === null) {
        throw new BioPublicError(`${String(entityType)} with id ${Number(entityId)} not found`, 404)
    }

    // Create backup request

    // return backup request
}

export const getBackupRequestsHander: Handler<GetBackupRequestsRequest, BackupRequestParams, unknown, GetBackupRequestsResponse> = async (req, res) => {
    // Validate entity information
    // Validate entity type and id
    const { entity: entityType, entityId } = req.params

    if (entityType === undefined) {
        throw BioMissingPathParamError('entity')
    }

    if (!(entityType in ALLOWED_BACKUP_TYPES)) {
        throw BioInvalidPathParamError({ entity: entityType })
    }

    if (entityId === undefined) {
        throw BioMissingPathParamError('entityId')
    }

    // Check if backup entity exists
    const entityGetter = BackupEntityGetters[entityType]
    const entity = await entityGetter(entityId)

    if (entity === undefined || entity === null) {
        throw new BioPublicError(`${String(entityType)} with id ${Number(entityId)} not found`, 404)
    }

    // get backup requests by entity id
}
