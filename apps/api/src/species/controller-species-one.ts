import { SpeciesOneParams, SpeciesOneResponse } from '@rfcx-bio/common/api-bio/species/species-one'
import { rawSpecies } from '@rfcx-bio/common/mock-data'

import { Controller } from '../_services/api-helper/types'
import { ApiNotFoundError } from '../_services/errors'
import { assertParamsExist } from '../_services/validation'

export const speciesOneController: Controller<SpeciesOneResponse, SpeciesOneParams> = async (req) => {
  // Inputs & validation
  const { speciesSlug } = req.params
  if (!speciesSlug) assertParamsExist({ speciesSlug })

  // Query
  const matchesSpecies = rawSpecies.find(s => s.speciesSlug === speciesSlug)

  // Response
  if (!matchesSpecies) throw ApiNotFoundError()
  return { species: matchesSpecies }
}
