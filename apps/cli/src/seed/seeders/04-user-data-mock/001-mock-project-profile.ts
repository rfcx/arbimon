import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ProjectProfile } from '@rfcx-bio/common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { mockProjectProfilesBySlug } from '../../data/manual/project-profile'

export const up: MigrationFn<QueryInterface> = async ({ context: { sequelize } }): Promise<void> => {
  const models = ModelRepository.getInstance(sequelize)

  // Lookups
  const projectSlugToId: Record<string, number> = await models.Project
    .findAll()
    .then(allProjects => Object.fromEntries(allProjects.map(s => [s.slug, s.id])))

  // Create profiles
  const projectsProfile: ProjectProfile[] = Object.entries(mockProjectProfilesBySlug)
    .map(([slug, profile]) => {
      // Try to find project ID
      const projectId = projectSlugToId[slug]
      if (!projectId) return undefined

      // Merge ID & profile data
      return {
        projectId,
        ...profile
      }
    })
    .filter(isDefined)

  await models.ProjectProfile.bulkCreate(projectsProfile)
}
