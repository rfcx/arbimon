import { QueryInterface } from 'sequelize'
import { MigrationFn } from 'umzug'

import { masterTaxonSpeciesSources, riskRatings } from '@rfcx-bio/common/dao/master-data'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpeciesCommonName, TaxonSpeciesDescription, TaxonSpeciesRiskRating } from '@rfcx-bio/common/dao/types'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { rawTaxonSpeciesIucn } from '../../data/manual/taxon-species-iucn'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize
  const models = ModelRepository.getInstance(sequelize)

  // Lookups
  const speciesSlugToId: Record<string, number> = await models.TaxonSpecies
    .findAll({
      attributes: ['id', 'slug'],
      raw: true
    })
    .then(res => Object.fromEntries(res.map(s => [s.slug, s.id])))

  const validRiskRatings = new Set(riskRatings.map(r => r.id))

  // Convert data
  const validData = rawTaxonSpeciesIucn
    .filter(s => s.slug in speciesSlugToId)
    .map(({ slug, ...rest }) => ({ taxonSpeciesId: speciesSlugToId[slug], ...rest }))

  const commonNames: TaxonSpeciesCommonName[] = validData
    .map(({ taxonSpeciesId, commonName }) => {
      if (!commonName) return undefined
      return { taxonSpeciesId, taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id, commonName }
    })
    .filter(isDefined)

  const descriptions: TaxonSpeciesDescription[] = validData
    .map(({ taxonSpeciesId, description, descriptionSourceUrl: sourceUrl }) => {
      if (!description || !sourceUrl) return undefined
      return { taxonSpeciesId, taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id, description, sourceUrl }
    })
    .filter(isDefined)

  const risks: TaxonSpeciesRiskRating[] = validData
    .map(({ taxonSpeciesId, riskRatingIucnId: riskRatingId, descriptionSourceUrl: sourceUrl }) => {
      if (!riskRatingId || !sourceUrl) return undefined
      if (!validRiskRatings.has(riskRatingId)) {
        console.warn(`Invalid risk rating: ${riskRatingId}`)
        return undefined
      }
      return { taxonSpeciesId, taxonSpeciesSourceId: masterTaxonSpeciesSources.IUCN.id, riskRatingId, sourceUrl }
    })
    .filter(isDefined)

  await models.TaxonSpeciesCommonName.bulkCreate(commonNames)
  await models.TaxonSpeciesDescription.bulkCreate(descriptions)
  await models.TaxonSpeciesRiskRating.bulkCreate(risks)
}
