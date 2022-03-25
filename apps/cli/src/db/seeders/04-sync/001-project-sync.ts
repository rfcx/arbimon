import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { getArbimonSequelize } from '@/data-ingest/_connections/arbimon'
import { syncProjects } from '@/sync/arbimon'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await syncProjects(getArbimonSequelize(), params.context.sequelize)
}
