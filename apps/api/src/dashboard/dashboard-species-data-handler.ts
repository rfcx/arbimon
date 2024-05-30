import { type HighlightedSpecies } from '@rfcx-bio/common/api-bio/dashboard/common'
import { type DashboardSpeciesDataParams, type DashboardSpeciesDataResponse, type SpeciesHighlightedBody, type SpeciesHighlightedResponse } from '@rfcx-bio/common/api-bio/dashboard/dashboard-species-data'
import { type LocationProjectSpecies, type RiskRatingIucn, type TaxonSpecies } from '@rfcx-bio/node-common/dao/types'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { deleteHighlightedSpecies, getHighlightedSpecies, getRichnessByRisk, getRichnessByTaxon, getSpeciesBySlug, getTotalSpecies, postHighlightedSpecies } from './dashboard-species-data-dao'

export const rawRiskRatings: RiskRatingIucn[] = [
  { id: -1, code: 'NL', isThreatened: false },
  { id: 0, code: 'NE', isThreatened: false },
  { id: 100, code: 'DD', isThreatened: false },
  { id: 200, code: 'LC', isThreatened: false },
  { id: 300, code: 'NT', isThreatened: true },
  { id: 400, code: 'VU', isThreatened: true },
  { id: 500, code: 'EN', isThreatened: true },
  { id: 600, code: 'CR', isThreatened: true },
  { id: 700, code: 'RE', isThreatened: false },
  { id: 800, code: 'EW', isThreatened: false },
  { id: 900, code: 'EX', isThreatened: false }
]

export const dashboardSpeciesDataHandler: Handler<DashboardSpeciesDataResponse, DashboardSpeciesDataParams> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }

  const [richnessByTaxon, richnessByRisk, totalSpecies, speciesHighlightedRaw] = await Promise.all([
    getRichnessByTaxon(projectIdInteger),
    getRichnessByRisk(projectIdInteger),
    getTotalSpecies(projectIdInteger),
    getHighlightedSpecies(projectIdInteger)
  ])

  return {
    richnessByRisk,
    richnessByTaxon,
    speciesHighlighted: speciesHighlightedRaw.map(({ taxonClassSlug, taxonSpeciesSlug, riskRatingId, ...rest }) => {
      return {
        ...rest,
        taxonSlug: taxonClassSlug,
        slug: taxonSpeciesSlug,
        riskId: riskRatingId
      }
    }),
    totalSpeciesCount: totalSpecies
  }
}

const combineLocationProjectSpecies = async (species: HighlightedSpecies[], projectIdInteger: number): Promise<LocationProjectSpecies[]> => {
  const bioSpecies = await getSpeciesBySlug(species.map(sp => sp.slug))
  return species.map(specie => {
    const taxonSpeciesId = bioSpecies.find((sp: TaxonSpecies) => sp.slug === specie.slug)
    const riskRatingLocalLevel = rawRiskRatings.find(rr => rr.code === specie.riskRating.code)
    return {
      locationProjectId: projectIdInteger,
      taxonSpeciesId: taxonSpeciesId ? taxonSpeciesId.id : -1,
      highlightedOrder: 0,
      description: '',
      riskRatingLocalLevel: riskRatingLocalLevel?.id ?? -1,
      riskRatingLocalCode: riskRatingLocalLevel?.code ?? '',
      riskRatingLocalSource: ''
    }
  })
}

export const dashboardSpeciesHighlightedPostHandler: Handler<SpeciesHighlightedResponse, DashboardSpeciesDataParams, unknown, SpeciesHighlightedBody> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }
  const species = req.body.species
  const locationProjectSpecies = await combineLocationProjectSpecies(species, projectIdInteger)
  await postHighlightedSpecies(locationProjectSpecies)
  return { message: 'Highlighted species are created' }
}

export const dashboardSpeciesHighlightedDeleteHandler: Handler<SpeciesHighlightedResponse, DashboardSpeciesDataParams, unknown, SpeciesHighlightedBody> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertPathParamsExist({ projectId })

  const projectIdInteger = Number(projectId)
  if (Number.isNaN(projectIdInteger)) {
    throw BioInvalidPathParamError({ projectId })
  }
  const species = req.body.species
  const locationProjectSpecies = await combineLocationProjectSpecies(species, projectIdInteger)
  await deleteHighlightedSpecies(locationProjectSpecies)
  return { message: 'Highlighted species are deleted' }
}
