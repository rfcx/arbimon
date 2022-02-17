import { SpeciesOneParams, SpeciesOneResponse } from '@rfcx-bio/common/api-bio/species/species-one'
import { rawSpecies } from '@rfcx-bio/common/mock-data'

import { Handler } from '../_services/api-helpers/types'
import { ApiNotFoundError } from '../_services/errors'
import { assertParamsExist } from '../_services/validation'

export const speciesOneHandler: Handler<SpeciesOneResponse, SpeciesOneParams> = async (req) => {
  // Inputs & validation
  const { speciesSlug } = req.params
  assertParamsExist({ speciesSlug })

  // Query
  const matchesSpecies = rawSpecies.find(s => s.speciesSlug === speciesSlug)

  // Response
  if (!matchesSpecies) throw ApiNotFoundError()
  return { species: matchesSpecies }
}
