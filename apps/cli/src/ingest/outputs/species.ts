import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_TAXON_SPECIES } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { SyncError } from '@rfcx-bio/common/dao/types'

import { SpeciesArbimon } from '../parsers/parse-species-arbimon-to-bio'

const loopUpsert = async (species: SpeciesArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const failedToInsertItems: Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>> = []
  for (const sp of species) {
    try {
      await ModelRepository.getInstance(sequelize).TaxonSpecies.upsert(sp)
    } catch (e: any) {
      // store insert errors
      failedToInsertItems.push({
        externalId: `${sp.idArbimon}`,
        error: e.message
      })
    }
  }
  return failedToInsertItems
}

export const writeSpeciesToBio = async (species: SpeciesArbimon[], sequelize: Sequelize, transaction: Transaction | null = null): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  try {
    await ModelRepository.getInstance(sequelize)
      .TaxonSpecies
      .bulkCreate(species, {
        updateOnDuplicate: UPDATE_ON_DUPLICATE_TAXON_SPECIES,
        ...transaction && { transaction }
      })
    return []
  } catch (batchInsertError) {
    console.error('⚠️ Batch insert of taxon spesies failed... try loop insert', batchInsertError)
    return await loopUpsert(species, sequelize)
  }
}
