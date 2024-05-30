import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { LocationProjectOrganizationModel } from '@rfcx-bio/node-common/dao/models/location-project-organization-model'
import { OrganizationModel } from '@rfcx-bio/node-common/dao/models/organization-model'

import { requireEnv } from '~/env'
import { rawEnvToLocationProjectOrganizations } from '../_data/location-project-organizations'

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const orgs = rawEnvToLocationProjectOrganizations[BIO_ENVIRONMENT]

  await OrganizationModel(sequelize).bulkCreate(orgs)
  await LocationProjectOrganizationModel(sequelize).bulkCreate([{ locationProjectId: 1, organizationId: 1 }])
}
