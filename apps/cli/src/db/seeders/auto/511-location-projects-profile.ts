import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { LocationProjectProfileModel } from '@rfcx-bio/common/dao/models/location-project-profile-model'
import { LocationProjectProfile } from '@rfcx-bio/common/dao/types'

import { requireEnv } from '~/env'
import { rawEnvToProjectAndProfile } from '../_data/location-project-and-profile'

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  const projectsProfile: LocationProjectProfile[] = rawEnvToProjectAndProfile[BIO_ENVIRONMENT]
    .map(({ id, summary, readme }) => ({
      locationProjectId: id,
      summary,
      readme
    }))

  await LocationProjectProfileModel(sequelize).bulkCreate(projectsProfile)
}
