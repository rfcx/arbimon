import { type Sequelize, QueryTypes } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import type { Backup } from '@rfcx-bio/common/dao/types/backup'

import { BATCH_LIMIT } from '@/backup/projects/config'

export interface ProjectBackupRequest {
    id: number
    projectId: number
    slug: string
    arbimonProjectId: number
    email: string
}

export const getPendingRequests = async (sequelize: Sequelize, offset: number, limit: number = BATCH_LIMIT): Promise<ProjectBackupRequest[]> => {
    const sql = `
        select
            backup.id as id,
            location_project.id as projectId,
            location_project.slug as slug,
            location_project.id_arbimon as arbimonProjectId,
            user_profile.email as email
        from
            backup join location_project on backup.entity_id = location_project.id
            left join user_profile on backup.requested_by = user_profile.id
        where backup.status = 'requested'
        limit :limit
        offset :offset
        order by backup.requested_at
    `

    return await sequelize.query<ProjectBackupRequest>(sql, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: {
            limit,
            offset
        }
    })
}

export const updateRequest = async (sequelize: Sequelize, id: number, updates: Partial<Backup>): Promise<void> => {
    const { Backup } = ModelRepository.getInstance(sequelize)
    const request = await Backup.findOne({
        where: {
            id
        }
    })

    if (request !== null) {
        await request.update(updates)
    }
}
