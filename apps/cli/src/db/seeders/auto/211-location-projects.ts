import { Optional, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'
import { Project } from '@rfcx-bio/common/dao/types'

import { requireEnv } from '~/env'

const {
  MOCK_PROJECT_NAME,
  MOCK_PROJECT_ID_CORE,
  MOCK_PROJECT_SLUG_ARBIMON
} = requireEnv('MOCK_PROJECT_NAME', 'MOCK_PROJECT_ID_CORE', 'MOCK_PROJECT_SLUG_ARBIMON')

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const projects: Array<Optional<Project, 'id'>> = [{
    idCore: MOCK_PROJECT_ID_CORE,
    slug: MOCK_PROJECT_SLUG_ARBIMON,
    slugArbimon: MOCK_PROJECT_SLUG_ARBIMON,
    name: MOCK_PROJECT_NAME,
    isPublished: true,
    latitudeNorth: 18.51375,
    latitudeSouth: 17.93168,
    longitudeEast: -65.24505,
    longitudeWest: -67.94469784
  }]

  await LocationProjectModel(params.context.sequelize).bulkCreate(projects)
}
