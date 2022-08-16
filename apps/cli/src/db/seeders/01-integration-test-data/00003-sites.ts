import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { LocationSiteModel } from '@rfcx-bio/common/dao/models/location-site-model'

import { sites } from '../_data/integration/project-sites'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  await LocationSiteModel(params.context.sequelize)
    .bulkCreate(sites)
}
