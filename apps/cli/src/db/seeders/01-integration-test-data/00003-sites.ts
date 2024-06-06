import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { LocationSiteModel } from '@rfcx-bio/node-common/dao/models/location-site-model'

import { sites } from '../_data/integration/project-sites'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  await LocationSiteModel(sequelize).bulkCreate(sites)
}
