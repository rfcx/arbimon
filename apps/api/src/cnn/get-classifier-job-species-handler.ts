import { type GetClassifierJobSpeciesParams, type GetClassifierJobSpeciesQueryParams, type GetClassifierJobSpeciesResponse, xTotalSpeciesCountHeaderName } from '@rfcx-bio/common/api-bio/cnn/classifier-job-species'

import { type Handler } from '~/api-helpers/types'
import { getClassifierJobSpecies } from './get-classifier-job-species-bll'

export const getClassifierJobSpeciesHandler: Handler<GetClassifierJobSpeciesResponse, GetClassifierJobSpeciesParams, GetClassifierJobSpeciesQueryParams> = async (req, res) => {
  const species = await getClassifierJobSpecies(req.headers.authorization ?? '', req.params.jobId, req.query)

  void res.header('access-control-expose-headers', xTotalSpeciesCountHeaderName)
  void res.header(xTotalSpeciesCountHeaderName, species.total)
  return species.data
}
