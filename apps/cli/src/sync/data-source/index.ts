import { Op, QueryTypes, Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { rawEnvToProjectAndProfile } from '@/db/seeders/_data/location-project-and-profile'
import { requireEnv } from '~/env'

export const getNeedSyncingProjects = async (sequelize: Sequelize, limit = 10): Promise<Project[]> => {
  // Temporarily prioritize some
  const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')
  const projectSlugs = [
      ...rawEnvToProjectAndProfile[BIO_ENVIRONMENT].map(project => project.slug),
      'destinos-awake',
      'las-balsas-jocotoco-foundation-project',
      'weforest-wildlife-corridors',
      'tech4nature-mexico'
    ]
    .map(s => `'${s}'`)
    .join(',')

  const sql = `
    SELECT DISTINCT
      CASE WHEN (lp.slug IN (${projectSlugs})) THEN 0 ELSE 1 END,
      lp.id,
      lp.id_arbimon,
      ds.updated_at
    FROM location_project lp
    LEFT JOIN data_source ds ON lp.id = ds.location_project_id
    WHERE ds.location_project_id IS NULL 
      OR DATE_PART('hour', AGE(CURRENT_TIMESTAMP, ds.updated_at)) >= 3
    ORDER BY 1, ds.updated_at NULLS FIRST
    LIMIT ${limit}
  `
  const projectIds = await sequelize
    .query<{ id: number, id_Arbimon: number, updated_at: Date | null }>(sql, { type: QueryTypes.SELECT, raw: true })
    .then(p => p.map(i => i.id))

  // TODO: Why is this a separate query?!
  return await ModelRepository.getInstance(sequelize).LocationProject.findAll({
    where: {
      id: { [Op.in]: projectIds }
    },
    raw: true
  })
}
