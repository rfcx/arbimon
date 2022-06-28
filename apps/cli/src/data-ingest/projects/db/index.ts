import { Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_LOCATION_PROJECT } from '@rfcx-bio/common/dao/models/location-project-model'
import { Project } from '@rfcx-bio/common/dao/types'

export const writeProjectsToPostgres = async (sequelize: Sequelize, projects: Array<Omit<Project, 'id'>>): Promise<void> => {
  const model = ModelRepository.getInstance(sequelize).LocationProject

  // update items
  const updatedRows = await model.bulkCreate(projects, {
    updateOnDuplicate: UPDATE_ON_DUPLICATE_LOCATION_PROJECT
  })

  console.info(`- writeProjectsToPostgres: bulk upsert ${updatedRows.length} projects`)
}
