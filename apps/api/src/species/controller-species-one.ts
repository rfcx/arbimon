import { SpeciesOneParams, SpeciesOneResponse } from '@rfcx-bio/common/api-bio/species/species-one'
import { rawSpecies } from '@rfcx-bio/common/mock-data'

import { Handler } from '../_services/api-helpers/types'
import { BioNotFoundError } from '../_services/errors'
import { assertPathParamsExist } from '../_services/validation'

export const speciesOneHandler: Handler<SpeciesOneResponse, SpeciesOneParams> = async (req) => {
  // Inputs & validation
  const { speciesSlug } = req.params
  assertPathParamsExist({ speciesSlug })

  // Query
  const matchesSpecies = rawSpecies.find(s => s.speciesSlug === speciesSlug)

  // Response
  if (!matchesSpecies) throw BioNotFoundError()
  return { species: matchesSpecies }
}
