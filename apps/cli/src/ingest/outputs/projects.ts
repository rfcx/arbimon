import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_LOCATION_PROJECT } from '@rfcx-bio/common/dao/models/location-project-model'
import { Project, SyncError } from '@rfcx-bio/common/dao/types'

import { ProjectArbimon } from '../parsers/parse-project-arbimon-to-bio'

// Temporary hack to provide default values (will remove once the Model type is upgraded to understand defaults)
const addDefaults = (project: ProjectArbimon): Omit<Project, 'id'> => ({ longitudeEast: 0, longitudeWest: 0, latitudeNorth: 0, latitudeSouth: 0, ...project })

const loopUpsert = async (projects: ProjectArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  for (const project of projects) {
    try {
      await ModelRepository.getInstance(sequelize).LocationProject.upsert(addDefaults(project))
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

export const writeProjectsToBio = async (projects: ProjectArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  try {
    await ModelRepository.getInstance(sequelize)
      .LocationProject
      .bulkCreate(projects.map(addDefaults), {
        updateOnDuplicate: UPDATE_ON_DUPLICATE_LOCATION_PROJECT,
        ...transaction && { transaction }
      })
    return []
  } catch (batchInsertError) {
    console.error('⚠️ Batch insert failed... try loop insert', batchInsertError)
    return await loopUpsert(projects, sequelize)
  }
}
