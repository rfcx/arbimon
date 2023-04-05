import { type Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_TAXON_SPECIES } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { type SyncError, type TaxonSpecies } from '@rfcx-bio/common/dao/types'

import { type SpeciesArbimon } from '../parsers/parse-species-arbimon-to-bio'

const transformSpeciesArbimonToTaxonSpeciesBio = (species: SpeciesArbimon): Omit<TaxonSpecies, 'id'> => ({ ...species })

const loopUpsert = async (species: Array<Omit<TaxonSpecies, 'id'>>, sequelize: Sequelize): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
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

export const writeSpeciesToBio = async (species: SpeciesArbimon[], sequelize: Sequelize): Promise< Array<Omit<SyncError, 'syncSourceId' | 'syncDataTypeId'>>> => {
  const taxonSpecies = species.map(transformSpeciesArbimonToTaxonSpeciesBio)
  try {
    await ModelRepository.getInstance(sequelize)
      .TaxonSpecies
      .bulkCreate(taxonSpecies, {
        updateOnDuplicate: UPDATE_ON_DUPLICATE_TAXON_SPECIES
      })
    return []
  } catch (batchInsertError) {
    console.error('⚠️ Batch insert of taxon species failed... try loop insert', (batchInsertError as any).errors)
    return await loopUpsert(taxonSpecies, sequelize)
  }
}
