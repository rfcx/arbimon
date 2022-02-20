import pkg from 'sequelize/dist'

import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'
import { Project } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '../../../db/connections'

const { Op } = pkg

export const writeProjectsToPostgres = async (projects: Array<Omit<Project, 'id'>>): Promise<void> => {
  const model = LocationProjectModel(getSequelize())
  // TODO: check id with mock for each environment
  // update items
  const updatedRows = await model.bulkCreate(projects, {
    updateOnDuplicate: [
      'name',
      'isPublished',
      'latitudeNorth',
      'latitudeSouth',
      'longitudeEast',
      'longitudeWest'
    ]
  })
  // delete non exist items
  const deletedRows = await model.destroy({
    where: {
      idCore: {
        [Op.notIn]: projects.map(p => p.idCore)
      }
    }
  })
  console.info(`- writeProjectsToPostgres: bulk upsert ${updatedRows.length} projects`)
  console.info(`- writeProjectsToPostgres: deleted ${deletedRows} projects`)
}
