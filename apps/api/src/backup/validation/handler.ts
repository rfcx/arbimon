import { ALLOWED_BACKUP_TYPES, BackupEntityGetters } from '@/backup/types'
import { assertProjectExportAllowed } from '@/projects/project-entitlement-bll'
import type { Middleware } from '~/api-helpers/types'
import { BioInvalidPathParamError, BioMissingPathParamError, BioPublicError, BioUnauthorizedError } from '~/errors'

interface EntityData {
    entity?: string
    entityId?: number
}

export const validationHandler: Middleware<void> = async (req): Promise<void> => {
    const { userId, method } = req
    if (userId === undefined) {
        throw BioUnauthorizedError()
    }

    const payload: Record<string, EntityData> = {
        GET: req.query as EntityData,
        POST: req.body as EntityData
    }

    // Validate entity data
    if (method !== undefined) {
        const entityData = payload[String(method)] ?? {}
        await validateRequest(entityData)
    }
}

const validateRequest = async (data: EntityData): Promise<void> => {
    const { entity: entityType, entityId } = data

    if (entityType === undefined) {
        throw BioMissingPathParamError('entity')
    }

    if (!(ALLOWED_BACKUP_TYPES.includes(entityType))) {
        throw BioInvalidPathParamError({ entity: entityType })
    }

    if (entityId === undefined) {
        throw BioMissingPathParamError('entityId')
    }

    // Check if entity record exists
    const entityGetter = BackupEntityGetters[entityType]
    const entity = await entityGetter(entityId)

    if (entity === undefined || entity === null) {
        throw new BioPublicError(`${String(entityType)} with id ${Number(entityId)} not found`, 404)
    }

    // Authorization is enforced upstream by the requireSuperUser preHandler
    // (SUPER_USER_EMAILS allow-list). Here we only keep the view-only guard
    // so a locked project still cannot have backups requested.
    if (entityType === 'project') {
        await assertProjectExportAllowed(entityId)
    }
}
