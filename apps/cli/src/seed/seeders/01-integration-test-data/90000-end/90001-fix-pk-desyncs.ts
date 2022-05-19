import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { fixPkDesyncs } from '@/db/_helpers'

const TABLES_WITH_AUTO_INCREMENT = [
  'project',
  'project_version',
  'project_site',
  'taxon_species',
  'sync_log_by_project'
]

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize
  await fixPkDesyncs(sequelize, TABLES_WITH_AUTO_INCREMENT)
}
