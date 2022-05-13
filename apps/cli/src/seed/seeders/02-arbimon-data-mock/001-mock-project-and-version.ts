import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ProjectVersion } from '@rfcx-bio/common/dao/types'

import { requireEnv } from '~/env'
import { mockProjectsByEnv } from '../../data/manual/project'

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize
  const models = ModelRepository.getInstance(sequelize)

  // Create projects
  const projects = mockProjectsByEnv[BIO_ENVIRONMENT]
  const projectsCreated = await models.Project.bulkCreate(projects)

  // Create project versions
  const projectVersions: Array<Omit<ProjectVersion, 'id' | 'isPublished' | 'isPublic'>> =
    projectsCreated.map(project => ({ projectId: project.id }))

  await models.ProjectVersion.bulkCreate(projectVersions)
}
