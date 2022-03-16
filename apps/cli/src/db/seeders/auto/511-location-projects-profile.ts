import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'
import { LocationProjectProfileModel } from '@rfcx-bio/common/dao/models/location-project-profile-model'
import { LocationProjectProfile } from '@rfcx-bio/common/dao/types'

import { requireEnv } from '~/env'
import { rawEnvToProjectAndProfile } from '../_data/location-project-and-profile'

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const projectSlugToId: Record<string, number> = await LocationProjectModel(sequelize)
    .findAll()
    .then(allProjects => Object.fromEntries(allProjects.map(s => [s.slug, s.id])))

  const projectsProfile: LocationProjectProfile[] = rawEnvToProjectAndProfile[BIO_ENVIRONMENT]
    .map(({ slug, summary, readme }) => ({
      locationProjectId: projectSlugToId[slug],
      summary,
      readme
    }))

  await LocationProjectProfileModel(sequelize).bulkCreate(projectsProfile)
}
