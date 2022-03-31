import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ATTRIBUTES_LOCATION_PROJECT, Project } from '@rfcx-bio/common/dao/types'

export const writeProjectsToPostgres = async (sequelize: Sequelize, projects: Array<Omit<Project, 'id'>>): Promise<void> => {
  const model = ModelRepository.getInstance(sequelize).Project

  // update items
  const updatedRows = await model.bulkCreate(projects, {
    updateOnDuplicate: ATTRIBUTES_LOCATION_PROJECT.updateOnDuplicate
  })

  console.info(`- writeProjectsToPostgres: bulk upsert ${updatedRows.length} projects`)
}
