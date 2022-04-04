import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ProjectProfile } from '@rfcx-bio/common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { requireEnv } from '~/env'
import { rawEnvToProjectAndProfile } from '../_data/location-project-and-profile'

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize
  const models = ModelRepository.getInstance(sequelize)

  // Lookups
  const projectSlugToId: Record<string, number> = await models.Project
    .findAll()
    .then(allProjects => Object.fromEntries(allProjects.map(s => [s.slug, s.id])))

  const projectsProfile: ProjectProfile[] = rawEnvToProjectAndProfile[BIO_ENVIRONMENT]
    .map(({ slug, summary, readme }) => {
      // Try to find project ID
      const projectId = projectSlugToId[slug]
      if (!projectId) return undefined

      return {
        projectId,
        summary,
        readme
      }
    })
    .filter(isDefined)

  await models.ProjectProfile.bulkCreate(projectsProfile)
}
