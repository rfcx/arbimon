import { SpeciesAllResponse } from '@rfcx-bio/common/api-bio/species/species-all'
import { rawSpecies } from '@rfcx-bio/common/mock-data'

import { Handler } from '../_services/api-helpers/types'

export const speciesAllHandler: Handler<{}, SpeciesAllResponse> = async (req) => {
  // Inputs & validation

  // Query

  // Response
  return rawSpecies
}
