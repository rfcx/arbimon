import { Sequelize, Transaction } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { UPDATE_ON_DUPLICATE_TAXON_SPECIES } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { TaxonSpecies } from '@rfcx-bio/common/dao/types'

export const writeSpeciesToBio = async (species: Array<Omit<TaxonSpecies, 'id'>>, sequelize: Sequelize, transaction: Transaction | null = null): Promise<void> => {
  const options = {
    updateOnDuplicate: UPDATE_ON_DUPLICATE_TAXON_SPECIES,
    ...(transaction) && { transaction }
  }

  // update items
  await ModelRepository.getInstance(sequelize).TaxonSpecies.bulkCreate(species, options)
}
