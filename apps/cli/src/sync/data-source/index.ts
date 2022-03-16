import { Op, QueryTypes, Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { rawEnvToProjectAndProfile } from '@/db/seeders/_data/location-project-and-profile'
import { requireEnv } from '~/env'

export const getNeedSyncingProjects = async (sequelize: Sequelize): Promise<Project[]> => {
  // TODO: [START] Stop filtering projects when we have a private "latest" mode
  const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')
  const idsToSync = rawEnvToProjectAndProfile[BIO_ENVIRONMENT].map(project => project.idArbimon)
  // TODO: [END]

  const sql = `
    SELECT DISTINCT lp.id, lp.id_arbimon, ds.updated_at 
    FROM location_project lp
    LEFT JOIN data_source ds ON lp.id = ds.location_project_id 
    WHERE lp.id_arbimon IN (${idsToSync.join(',')})
      AND (ds.location_project_id IS NULL OR DATE_PART('hour',AGE(CURRENT_TIMESTAMP, lp.updated_at)) >= 1)
    ORDER BY ds.updated_at DESC
    LIMIT 10
    `

    const projectIds = await sequelize
    .query<{ id: number, id_Arbimon: number, updated_at: Date | null }>(sql, { type: QueryTypes.SELECT, raw: true })
    .then(p => p.map(i => i.id))

    return await ModelRepository.getInstance(sequelize).LocationProject.findAll({
      where: {
        id: {
          [Op.in]: projectIds
        }
      },
      raw: true
    })
}
