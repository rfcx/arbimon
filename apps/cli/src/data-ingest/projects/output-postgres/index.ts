import pkg from 'sequelize/dist'

import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'
import { Project } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '../../../db/connections'

const { Op } = pkg

export const writeProjectsToPostgres = async (projects: Array<Omit<Project, 'id'>>): Promise<void> => {
  const model = LocationProjectModel(getSequelize())
  // update items
  await model.bulkCreate(projects, { updateOnDuplicate: ['name', 'isPublished', 'latitudeNorth', 'latitudeSouth', 'longitudeEast', 'longitudeWest'] })
  // delete non exist items
  await model.destroy({
    where: {
      idCore: {
        [Op.notIn]: projects.map(p => p.idCore)
      }
    }
  })
}
