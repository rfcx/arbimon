import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { SPECIES_SOURCE_IUCN } from '@rfcx-bio/common/api-bio/species/types'
import { RiskRatingIucnModel } from '@rfcx-bio/common/dao/models/risk-rating-iucn-model'
import { TaxonSpeciesIucnModel } from '@rfcx-bio/common/dao/models/taxon-species-iucn-model'
import { TaxonSpeciesModel } from '@rfcx-bio/common/dao/models/taxon-species-model'
import { TaxonSpeciesIucn } from '@rfcx-bio/common/dao/types'
import { rawSpecies } from '@rfcx-bio/common/mock-data'
import { isDefined } from '@rfcx-bio/utils/predicates'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const speciesSlugToId: Record<string, number> = await TaxonSpeciesModel(sequelize).findAll()
    .then(allSpecies => Object.fromEntries(allSpecies.map(s => [s.slug, s.id])))

  const iucnCodeToId: Record<string, number> = await RiskRatingIucnModel(sequelize).findAll()
    .then(allRatings => Object.fromEntries(allRatings.map(r => [r.code, r.id])))

  // Convert data
  const data: TaxonSpeciesIucn[] =
    rawSpecies.map(({ speciesSlug, commonName, extinctionRisk, information }) => {
      const info = information.find(i => i.sourceType === SPECIES_SOURCE_IUCN) ?? { description: '', sourceUrl: '' }

      return {
        taxonSpeciesId: speciesSlugToId[speciesSlug],
        commonName,
        riskRatingIucnId: iucnCodeToId[extinctionRisk],
        description: info.description,
        descriptionSourceUrl: info.sourceUrl
      }
    })
    .filter(isDefined)

  await TaxonSpeciesIucnModel(sequelize).bulkCreate(data)
}
