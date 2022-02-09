import { Optional, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { ProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'
import { Project } from '@rfcx-bio/common/dao/types'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const projects: Array<Optional<Project, 'id'>> = [{
    idCore: '',
    idArbimon: 123,
    slug: 'puerto-rico',
    name: 'Puerto Rico Island-Wide',
    latitudeNorth: 18.51375,
    latitudeSouth: 17.93168,
    longitudeEast: -65.24505,
    longitudeWest: -67.94469784
  }]

  await ProjectModel(params.context.sequelize).bulkCreate(projects)
}
