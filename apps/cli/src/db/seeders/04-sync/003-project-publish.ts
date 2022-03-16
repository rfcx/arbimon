import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'

import { rawEnvToProjectAndProfile } from '@/db/seeders/_data/location-project-and-profile'
import { requireEnv } from '~/env'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')
  const slugsToPublish = rawEnvToProjectAndProfile[BIO_ENVIRONMENT].map(project => project.slug)

  await LocationProjectModel(params.context.sequelize)
    .update(
      { isPublished: true },
      { where: { slug: slugsToPublish } }
    )
}
