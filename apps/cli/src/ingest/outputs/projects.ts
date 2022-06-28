import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_LOCATION_PROJECT } from '@rfcx-bio/common/dao/models/location-project-model'
import { Project } from '@rfcx-bio/common/dao/types'

import { createProjectVersionIfNeeded } from './project-version'

export const writeProjectsToBio = async (projects: Array<Omit<Project, 'id'>>, sequelize: Sequelize, transaction: Transaction | null = null): Promise<void> => {
  const options = {
    updateOnDuplicate: UPDATE_ON_DUPLICATE_LOCATION_PROJECT,
    ...(transaction) && { transaction }
  }

  // update items
  await ModelRepository.getInstance(sequelize).LocationProject.bulkCreate(projects, options)

  // create all missing project versions
  await createProjectVersionIfNeeded(sequelize, transaction)

  // TODO: return ids+error for failed to insert projects

  // console.info(`- writeProjectsToBio: bulk upsert ${updatedRows.length} projects`)
}
