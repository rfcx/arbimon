import { RichnessDatasetParams, RichnessDatasetQuery, RichnessDatasetResponse } from '@rfcx-bio/common/api-bio/richness/richness-dataset'

import { Handler } from '../_services/api-helper/types'
import { assertParamsExist } from '../_services/validation'

export const RichnessHandler: Handler<RichnessDatasetResponse, RichnessDatasetParams, RichnessDatasetQuery> = async (req) => {
  // Inputs & validation
  const { projectId } = req.params
  assertParamsExist({ projectId })

  // Query
  const filteredDetections = ''

  return {
    detectionCount: 0
  }
}
