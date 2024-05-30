import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { LocationProjectModel } from '@rfcx-bio/node-common/dao/models/location-project-model'
import { type Project } from '@rfcx-bio/node-common/dao/types'

import { requireEnv } from '~/env'
import { rawEnvToProjectAndProfile } from '../_data/location-project-and-profile'

const { BIO_ENVIRONMENT } = requireEnv('BIO_ENVIRONMENT')

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  const projects: Array<Omit<Project, 'id'>> = rawEnvToProjectAndProfile[BIO_ENVIRONMENT]
    .map(({ idCore, idArbimon, slug, name, status, statusUpdatedAt, latitudeNorth, latitudeSouth, longitudeEast, longitudeWest }) => ({
      idCore,
      idArbimon,
      slug,
      name,
      status,
      statusUpdatedAt,
      latitudeNorth,
      latitudeSouth,
      longitudeEast,
      longitudeWest
    }))

  await LocationProjectModel(sequelize).bulkCreate(projects)
}
