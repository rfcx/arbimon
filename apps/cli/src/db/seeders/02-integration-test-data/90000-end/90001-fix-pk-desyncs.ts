import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { fixPkDesyncs } from '@/db/_helpers/fix-pk-desync'

const TABLES_WITH_AUTO_INCREMENT = [
  'location_project',
  'project_version',
  'location_site',
  'taxon_species',
  'sync_log_by_project'
]

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  await fixPkDesyncs(sequelize, TABLES_WITH_AUTO_INCREMENT)
}
