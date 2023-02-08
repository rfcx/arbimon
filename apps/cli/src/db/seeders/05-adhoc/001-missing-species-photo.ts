import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { TaxonSpeciesPhotoModel, UPDATE_ON_DUPLICATE_TAXON_SPECIES_PHOTO } from '@rfcx-bio/common/dao/models/taxon-species-photo-model'
import { TaxonSpeciesPhoto } from '@rfcx-bio/common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { rawMissingTaxonSpeciesPhoto } from '../_data/missing-taxon-species-photo'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const speciesSlugToId: Record<string, number> = await TaxonSpeciesModel(sequelize)
    .findAll({ attributes: ['id', 'slug'] })
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.slug, s.id])))

  // Convert data
  const data: TaxonSpeciesPhoto[] = rawMissingTaxonSpeciesPhoto
    .map(({ slug, ...rest }) => {
      const taxonSpeciesId = speciesSlugToId[slug]
      if (!taxonSpeciesId) return undefined

      return {
        taxonSpeciesId,
        ...rest
      }
    }).filter(isDefined)

  await TaxonSpeciesPhotoModel(sequelize).bulkCreate(data, {
    updateOnDuplicate: UPDATE_ON_DUPLICATE_TAXON_SPECIES_PHOTO
  })
}
