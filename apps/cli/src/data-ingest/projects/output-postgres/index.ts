import pkg from 'sequelize'

import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'
import { ATTRIBUTES_LOCATION_PROJECT, Project } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '../../../db/connections'

const { Op } = pkg

export const writeProjectsToPostgres = async (projects: Array<Omit<Project, 'id'>>): Promise<void> => {
  const model = LocationProjectModel(getSequelize())

  // update items
  const updatedRows = await model.bulkCreate(projects, {
    updateOnDuplicate: ATTRIBUTES_LOCATION_PROJECT.updateOnDuplicate
  })

  // delete non exist items
  const deletedRows = await model.destroy({
    where: {
      idCore: {
        [Op.ne]: null,
        [Op.notIn]: projects.map(p => p.idCore)
      }
    }
  })

  console.info(`- writeProjectsToPostgres: bulk upsert ${updatedRows.length} projects`)
  console.info(`- writeProjectsToPostgres: deleted ${deletedRows} projects`)
}
