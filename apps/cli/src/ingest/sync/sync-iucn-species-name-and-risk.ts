import { unzip } from 'lodash-es'

import { masterRiskRatings, masterTaxonSpeciesSources } from '@rfcx-bio/common/dao/master-data'
import { AllModels } from '@rfcx-bio/common/dao/model-repository'
import { TaxonSpeciesCommonName, TaxonSpeciesRiskRating } from '@rfcx-bio/common/dao/types'
import { promiseSequential } from '@rfcx-bio/utils/async'
import { isDefined } from '@rfcx-bio/utils/predicates'

import { IucnService } from '@/ingest/_connections/iucn'
import { getIucnSpeciesNameAndRisk, IucnSpeciesNameAndRisk } from '@/ingest/inputs/iucn-species-name-and-risk'

export const syncIucnSpeciesNameAndRisk = async (models: AllModels, iucnService: IucnService): Promise<void> => {
  // Get species to sync
  const speciesToSync = await models.TaxonSpecies
    .findAll({
      // where: {} // TODO: Think of a way to track the last time each sync was attempted (ex: don't keep spamming IUCN for species they don't have)
      attributes: ['id', 'scientificName'],
      limit: 100,
      order: [['scientificName', 'ASC']],
      raw: true
    })
  console.info(`Found ${speciesToSync.length} species to sync`)

  // Call IUCN APIs
  const maybeNamesAndRisks = await promiseSequential( // TODO: Call batching
    speciesToSync.map(async s => await getIucnSpeciesNameAndRisk(iucnService, s.scientificName)
      .then(nameAndRisk => iucnNameAndRiskToBio(s.id, masterTaxonSpeciesSources.IUCN.id, iucnService.getIucnSpeciesSourceUrl(s.scientificName), nameAndRisk))
  ))

  const [maybeNames, maybeRisks] = unzip(maybeNamesAndRisks)
  const names = maybeNames.filter(isDefined) as TaxonSpeciesCommonName[]
  const risks = maybeRisks.filter(isDefined) as TaxonSpeciesRiskRating[]

  // Save
  console.info(`Saving ${names.length} common names, ${risks.length} risk ratings`)
  await models.TaxonSpeciesCommonName.bulkCreate(names)
  await models.TaxonSpeciesRiskRating.bulkCreate(risks)
}

export const iucnNameAndRiskToBio = (taxonSpeciesId: number, taxonSpeciesSourceId: number, sourceUrl: string, nameAndRisk?: IucnSpeciesNameAndRisk): [TaxonSpeciesCommonName | undefined, TaxonSpeciesRiskRating | undefined] => [
  iucnCommonNameToBio(taxonSpeciesId, taxonSpeciesSourceId, nameAndRisk?.commonName),
  iucnRiskRatingToBio(taxonSpeciesId, taxonSpeciesSourceId, sourceUrl, nameAndRisk?.riskRatingCode)
]

export const iucnCommonNameToBio = (taxonSpeciesId: number, taxonSpeciesSourceId: number, commonName?: string): TaxonSpeciesCommonName | undefined => {
  if (!commonName) return undefined

  return {
    taxonSpeciesId,
    taxonSpeciesSourceId,
    commonName
  }
}

export const iucnRiskRatingToBio = (taxonSpeciesId: number, taxonSpeciesSourceId: number, sourceUrl: string, riskRatingCode?: string): TaxonSpeciesRiskRating | undefined => {
  if (!riskRatingCode) return undefined
  if (!(riskRatingCode in masterRiskRatings)) {
    console.warn(`Risk rating code ${riskRatingCode} not found in master data`)
    return undefined
  }

  return {
    taxonSpeciesId,
    taxonSpeciesSourceId,
    riskRatingId: masterRiskRatings[riskRatingCode as keyof typeof masterRiskRatings].id,
    sourceUrl
  }
}
