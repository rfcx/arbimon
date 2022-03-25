import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { getArbimonSequelize } from '@/data-ingest/_connections/arbimon'
import { syncAllForProject } from '@/sync/all'
import { getNeedSyncingProjects } from '@/sync/data-source'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const arbimonSequelize = getArbimonSequelize()
  const bioSequelize = params.context.sequelize

  console.info('STEP: Get project lookups')
  const syncingProjects = await getNeedSyncingProjects(bioSequelize)

  console.info('STEP: Sync site, species, and detections')
  for (const project of syncingProjects) {
    await syncAllForProject(arbimonSequelize, bioSequelize, project)
  }
}
