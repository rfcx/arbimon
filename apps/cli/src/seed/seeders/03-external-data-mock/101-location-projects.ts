import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { Project } from '@rfcx-bio/common/dao/types'

import { requireEnv } from '~/env'
import { rawEnvToProjectAndProfile } from '../../data/manual/location-project-and-profile'

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize
  const models = ModelRepository.getInstance(sequelize)

  const projects: Array<Omit<Project, 'id'>> = rawEnvToProjectAndProfile[BIO_ENVIRONMENT]
    .map(({ idCore, idArbimon, slug, slugArbimon, name }) => ({
      idCore,
      idArbimon,
      slug,
      slugArbimon,
      name
    }))

  await models.Project.bulkCreate(projects)
}
