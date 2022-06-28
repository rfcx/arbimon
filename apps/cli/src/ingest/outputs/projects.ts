import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_LOCATION_PROJECT } from '@rfcx-bio/common/dao/models/location-project-model'
import { Project, SyncError } from '@rfcx-bio/common/dao/types'

const loopUpsert = async (projects: Array<Omit<Project, 'id'>>, sequelize: Sequelize, transaction: Transaction | null = null): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  for (const project of projects) {
    try {
      await ModelRepository.getInstance(sequelize).LocationProject.upsert(project)
    } catch (e: any) {
      // store insert errors
      failedToInsertItems.push({
        externalId: `${project.idArbimon}`,
        error: e.message
      })
    }
  }
  return failedToInsertItems
}

export const writeProjectsToBio = async (projects: Array<Omit<Project, 'id'>>, sequelize: Sequelize, transaction: Transaction | null = null): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  try {
    await ModelRepository.getInstance(sequelize)
      .LocationProject
      .bulkCreate(projects, {
        updateOnDuplicate: UPDATE_ON_DUPLICATE_LOCATION_PROJECT,
        ...transaction && { transaction }
      })
    return []
  } catch (batchInsertError) {
    console.error('⚠️ Batch insert failed (%s)... try loop insert', batchInsertError.message)
    return await loopUpsert(projects, sequelize)
  }
}
