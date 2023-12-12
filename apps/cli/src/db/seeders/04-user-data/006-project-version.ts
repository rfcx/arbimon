import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'
import { ProjectVersionModel } from '@rfcx-bio/common/dao/models/project-version-model'
import { type ProjectVersion } from '@rfcx-bio/common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { requireEnv } from '~/env'
import { rawEnvToProjectAndProfile } from '../_data/location-project-and-profile'

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const projectSlugToId: Record<string, number> = await LocationProjectModel(sequelize)
    .findAll()
    .then(allProjects => Object.fromEntries(allProjects.map(s => [s.slug, s.id])))

  const projectVersion: Array<Omit<ProjectVersion, 'id'>> = rawEnvToProjectAndProfile[BIO_ENVIRONMENT].map(({ slug, isPublic, isPublished }) => {
    // Try to find project ID
    const locationProjectId = projectSlugToId[slug]
    if (!locationProjectId) return undefined

    return {
      locationProjectId,
      isPublic,
      isPublished
    }
  }).filter(isDefined)

  await ProjectVersionModel(sequelize).bulkCreate(projectVersion)
}
