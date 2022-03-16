import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { TaxonSpeciesPhotoModel } from '@rfcx-bio/common/dao/models/taxon-species-photo-model'
import { TaxonSpeciesPhoto } from '@rfcx-bio/common/dao/types'
import { SOURCES } from '@rfcx-bio/common/dao/types/source'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { rawWikiData } from '@/db/seeders/_data/taxon-species-wiki'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const speciesNameToId: Record<string, number> = await TaxonSpeciesModel(sequelize).findAll()
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.scientificName, s.id])))

  // Convert data
  const data: TaxonSpeciesPhoto[] = Object.entries(rawWikiData)
    .map(([scientificName, data]) => {
      if (!data.thumbnailImage) return undefined

      return {
        taxonSpeciesId: speciesNameToId[scientificName],
        source: SOURCES.wiki,
        photoUrl: data.thumbnailImage,
        photoCaption: data.title,
        photoAuthor: data.credit ?? '', // TODO: Review if it allowed in 546
        photoLicense: data.license ?? '', // TODO: Review if it allowed in 546
        photoLicenseUrl: data.licenseUrl
      }
    })
    .filter(isDefined)

  await TaxonSpeciesPhotoModel(sequelize).bulkCreate(data)
}
