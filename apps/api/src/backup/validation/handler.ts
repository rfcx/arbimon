import { type ProjectPermission, hasPermission } from '@rfcx-bio/common/roles'

import { ALLOWED_BACKUP_TYPES, BackupEntityGetters } from '@/backup/types'
import { getUserRoleForProject } from '@/projects/dao/project-member-dao'
import type { Middleware } from '~/api-helpers/types'
import {
    BioForbiddenError,
    BioInvalidPathParamError,
    BioMissingPathParamError,
    BioPublicError,
    BioUnauthorizedError
} from '~/errors'

const DEFAULT_PERMISSION: ProjectPermission = 'delete-project'
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
        await validateRequest(entityData, userId)
    }
}

const validateRequest = async (data: EntityData, userId: number): Promise<void> => {
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

    // Check project permissions for project backups
    if (entityType === 'project') {
        await checkProjectPermissions(userId, entityId)
    }
}

const checkProjectPermissions = async (userId: number, projectId: number, permission: ProjectPermission = DEFAULT_PERMISSION): Promise<void> => {
    const role = projectId !== undefined ? await getUserRoleForProject(userId, Number(projectId)) : 'none'
    if (!hasPermission(role, permission)) {
        throw BioForbiddenError()
    }
}
