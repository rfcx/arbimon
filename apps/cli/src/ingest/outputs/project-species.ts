import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { LocationProjectSpecies, SyncError } from '@rfcx-bio/common/dao/types'

import { ProjectSpeciesArbimon } from '../parsers/parse-project-species-arbimon-to-bio'

const transformProjectSpecies = (projectSpecies: ProjectSpeciesArbimon): LocationProjectSpecies => ({ ...projectSpecies })

const loopUpsert = async (projectSpecies: ProjectSpeciesArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  for (const sp of projectSpecies) {
    try {
      await ModelRepository.getInstance(sequelize).LocationProjectSpecies.upsert(sp)
    } catch (e: any) {
      // store insert errors
      failedToInsertItems.push({
        externalId: `${sp.taxonSpeciesId}`,
        error: e.message
      })
    }
  }
  return failedToInsertItems
}

export const writeProjectSpeciesToBio = async (projectSpecies: ProjectSpeciesArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  try {
    await ModelRepository.getInstance(sequelize)
      .LocationProjectSpecies
      .bulkCreate(projectSpecies.map(transformProjectSpecies), {
        ...transaction && { transaction }
      })
    return []
  } catch (batchInsertError) {
    console.error('⚠️ Batch insert of project species failed... try loop insert', batchInsertError)
    return await loopUpsert(projectSpecies, sequelize)
  }
}
