import { Op, Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ATTRIBUTES_LOCATION_PROJECT, Project } from '@rfcx-bio/common/dao/types'

export const writeProjectsToPostgres = async (sequelize: Sequelize, projects: Array<Omit<Project, 'id'>>): Promise<void> => {
  const model = ModelRepository.getInstance(sequelize).LocationProject

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
