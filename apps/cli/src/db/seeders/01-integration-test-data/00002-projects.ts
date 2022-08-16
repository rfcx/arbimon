import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'

import { projects } from '../_data/integration/projects'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await LocationProjectModel(params.context.sequelize)
    .bulkCreate(projects)
}
