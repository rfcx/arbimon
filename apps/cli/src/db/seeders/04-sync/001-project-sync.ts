import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { syncProjects } from '@/sync/arbimon'
import { getArbimonSequelize } from '@/data-ingest/_connections/arbimon'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await syncProjects(getArbimonSequelize(), params.context.sequelize)
}
