import { type Sequelize, QueryTypes } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import type { Backup } from '@rfcx-bio/node-common/dao/types/backup'

import { BATCH_LIMIT } from '@/backup/projects/config'

export interface ProjectBackupRequest {
  id: number
  projectId: number
  slug: string
  arbimonProjectId: number
  projectName: string
  userEmail: string
  userName: string
}

export const getPendingRequests = async (
  sequelize: Sequelize,
  limit: number = BATCH_LIMIT
): Promise<ProjectBackupRequest[]> => {
  const sql = `
    select
      b.id,
      p.id as "projectId",
      p.slug as slug,
      p.id_arbimon as "arbimonProjectId",
      p.name as "projectName",
      u.email as "userEmail",
      concat(u.first_name, ' ', u.last_name) "userName"
    from backup b 
    join location_project p on b.entity_id = p.id
    left join user_profile u on b.requested_by = u.id
    where b.status = 'requested'
    order by b.requested_at
    limit $limit
    `

  return await sequelize.query<ProjectBackupRequest>(sql, {
    type: QueryTypes.SELECT,
    raw: true,
    bind: { limit }
  })
}

export const updateRequest = async (
  sequelize: Sequelize,
  id: number,
  updates: Partial<Backup>
): Promise<void> => {
  const { Backup } = ModelRepository.getInstance(sequelize)
  const request = await Backup.findByPk(id)

  if (request !== null) {
    await request.update(updates)
  }
}
