import { Optional, QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { TaxonSpeciesPhotoModel } from '@rfcx-bio/common/dao/models/taxon-species-photo-model'
import { TaxonSpeciesPhoto } from '@rfcx-bio/common/dao/types'
import { rawSpecies } from '@rfcx-bio/common/mock-data'
import { isDefined } from '@rfcx-bio/utils/predicates'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // PK Lookups
  const speciesSlugToId: Record<string, number> = await TaxonSpeciesModel(sequelize).findAll()
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.slug, s.id])))

  // Convert data
  const data: Array<Optional<TaxonSpeciesPhoto, 'id'>> =
    rawSpecies.map(({ speciesSlug, thumbnailImageUrl, imageCaption }) => {
      return thumbnailImageUrl
        ? {
          taxonSpeciesId: speciesSlugToId[speciesSlug],
          photoUrl: thumbnailImageUrl ?? '',
          photoCaption: imageCaption,
          photoAuthor: '',
          photoLicense: '',
          photoLicenseUrl: ''
        }
        : undefined
    })
    .filter(isDefined)

  await TaxonSpeciesPhotoModel(sequelize).bulkCreate(data)
}
