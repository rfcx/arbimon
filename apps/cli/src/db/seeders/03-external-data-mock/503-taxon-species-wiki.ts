import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { SPECIES_SOURCE_WIKI } from '@rfcx-bio/common/api-bio/species/types'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { TaxonSpeciesWikiModel } from '@rfcx-bio/common/dao/models/taxon-species-wiki-model'
import { TaxonSpeciesWiki } from '@rfcx-bio/common/dao/types'
import { rawSpecies } from '@rfcx-bio/common/mock-data'
import { isDefined } from '@rfcx-bio/utils/predicates'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const speciesSlugToId: Record<string, number> = await TaxonSpeciesModel(sequelize).findAll()
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.slug, s.id])))

  // Convert data
  const data: TaxonSpeciesWiki[] =
    rawSpecies.map(({ speciesSlug, information }) => {
      const info = information.find(i => i.sourceType === SPECIES_SOURCE_WIKI)

      return {
        taxonSpeciesId: speciesSlugToId[speciesSlug],
        description: info?.description ?? 'Blah blah blah',
        descriptionSourceUrl: info?.sourceUrl ?? ''
      }
    })
    .filter(isDefined)

  await TaxonSpeciesWikiModel(sequelize).bulkCreate(data)
}
