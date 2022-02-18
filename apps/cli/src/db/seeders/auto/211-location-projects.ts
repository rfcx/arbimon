import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'

import { requireEnv } from '~/env'
import { rawProjects } from '../_data/location-project'

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const projects = rawProjects[BIO_ENVIRONMENT]
  await LocationProjectModel(params.context.sequelize).bulkCreate(projects)
}
