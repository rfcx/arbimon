import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { syncAllForProject } from '@/sync/all'
import { getNeedSyncingProjects } from '@/sync/data-source'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  console.info('STEP: Get project lookups')
  const syncingProjects = await getNeedSyncingProjects(sequelize)

  console.info('STEP: Sync site, species, and detections')
  for (const project of syncingProjects) {
    await syncAllForProject(sequelize, project)
  }
}
