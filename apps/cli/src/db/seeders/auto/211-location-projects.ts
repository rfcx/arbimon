import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'

import { requireEnv } from '~/env'
import { rawEnvToProjectAndProfile } from '../_data/location-project-and-profile'

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  const projects = rawEnvToProjectAndProfile[BIO_ENVIRONMENT]

  await LocationProjectModel(sequelize).bulkCreate(projects).then(async () => {
    // fix auto increment key break - https://github.com/sequelize/sequelize/issues/9295
    await sequelize.query('select setval(\'location_project_id_seq\', (select max(id) from location_project), true);')
  })
}
