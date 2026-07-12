import { type FastifyRequest } from 'fastify'

import { isSuperUser } from '@/_services/auth0/is-super-user'
import { ALLOWED_BACKUP_TYPES, BackupEntityGetters } from '@/backup/types'
import { getUserRoleForProject } from '@/projects/dao/project-member-dao'
import { getProjectCapabilities } from '@/projects/project-capabilities-bll'
import { assertProjectExportAllowed } from '@/projects/project-entitlement-bll'
import type { Middleware } from '~/api-helpers/types'
import { BioForbiddenError, BioInvalidPathParamError, BioMissingPathParamError, BioPublicError, BioUnauthorizedError } from '~/errors'

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
        await validateRequest(entityData, userId, req)
    }
}

const validateRequest = async (data: EntityData, userId: number, req: FastifyRequest): Promise<void> => {
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

    if (entityType === 'project') {
        // Authorization (2026-07-12, operator D3): super users always; project
        // admins/owners may self-serve backups for SMALL projects
        // (<= PROJECT_BACKUP_MAX_RECORDINGS, default 100 recordings).
        if (!isSuperUser(req)) {
            const role = await getUserRoleForProject(userId, Number(entityId))
            const capabilities = await getProjectCapabilities(req.headers.authorization ?? '', Number(entityId), role, false)
            if (!capabilities.canBackup) {
                throw BioForbiddenError()
            }
        }

        // View-only guard: a locked project still cannot have backups requested.
        await assertProjectExportAllowed(entityId)
    }
}
