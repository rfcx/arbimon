import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'

import { projects } from '../_data/integration/projects'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  await LocationProjectModel(sequelize).bulkCreate(projects)
}
