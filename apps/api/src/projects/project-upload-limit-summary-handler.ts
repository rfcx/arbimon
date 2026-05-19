import { type ProjectUploadLimitSummaryParams, type ProjectUploadLimitSummaryResponse } from '@rfcx-bio/common/api-bio/project/project-upload-limit-summary'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getProjectUploadLimitSummaryByCoreId } from './projects-bll'

export const projectUploadLimitSummaryHandler: Handler<ProjectUploadLimitSummaryResponse, ProjectUploadLimitSummaryParams> = async (req) => {
  const { idCore } = req.params
  assertPathParamsExist({ idCore })

  if (typeof idCore !== 'string' || idCore.trim().length === 0) {
    throw BioInvalidPathParamError({ idCore })
  }

  return await getProjectUploadLimitSummaryByCoreId(idCore, req.headers.authorization ?? '')
}
