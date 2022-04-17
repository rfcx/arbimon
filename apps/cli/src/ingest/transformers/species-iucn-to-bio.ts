import { masterRiskRatings } from '@rfcx-bio/common/dao/master-data'
import { TaxonSpeciesCommonName, TaxonSpeciesDescription, TaxonSpeciesRiskRating } from '@rfcx-bio/common/dao/types'

import { IucnSpeciesNameAndRisk } from '@/ingest/inputs/iucn-species-name-and-risk'

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

export const iucnNameAndRiskToBio = (taxonSpeciesId: number, taxonSpeciesSourceId: number, sourceUrl: string, nameAndRisk?: IucnSpeciesNameAndRisk): [TaxonSpeciesCommonName | undefined, TaxonSpeciesRiskRating | undefined] => [
  iucnCommonNameToBio(taxonSpeciesId, taxonSpeciesSourceId, nameAndRisk?.commonName),
  iucnRiskRatingToBio(taxonSpeciesId, taxonSpeciesSourceId, sourceUrl, nameAndRisk?.riskRatingCode)
]

export const iucnDescriptionToBio = (taxonSpeciesId: number, taxonSpeciesSourceId: number, sourceUrl: string, description?: string): TaxonSpeciesDescription | undefined => {
  if (!description) return undefined

  return {
    taxonSpeciesId,
    taxonSpeciesSourceId,
    sourceUrl,
    description
  }
}
