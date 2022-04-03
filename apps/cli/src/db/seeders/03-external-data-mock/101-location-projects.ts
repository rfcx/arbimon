import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ProjectModel } from '@rfcx-bio/common/dao/models-table/project-model'
import { Project } from '@rfcx-bio/common/dao/types'

import { requireEnv } from '~/env'
import { rawEnvToProjectAndProfile } from '../_data/location-project-and-profile'

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  const projects: Array<Omit<Project, 'id'>> = rawEnvToProjectAndProfile[BIO_ENVIRONMENT]
    .map(({ idCore, idArbimon, slug, slugArbimon, name, latitudeNorth, latitudeSouth, longitudeEast, longitudeWest }) => ({
      idCore,
      idArbimon,
      slug,
      slugArbimon,
      name,
      latitudeNorth,
      latitudeSouth,
      longitudeEast,
      longitudeWest
    }))

  await ProjectModel(sequelize).bulkCreate(projects)
}
