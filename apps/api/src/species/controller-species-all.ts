import { SpeciesAllResponse } from '@rfcx-bio/common/api-bio/species/species-all'
import { rawSpecies } from '@rfcx-bio/common/mock-data'

import { Controller } from '../_services/api-helper/types'

export const speciesAllController: Controller<{}, SpeciesAllResponse> = async (req) => {
  // Inputs & validation

  // Query

  // Response
  return rawSpecies
}
