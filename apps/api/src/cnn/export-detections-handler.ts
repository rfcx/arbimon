import { type ExportDetectionsBody, type ExportDetectionsParams, EXPORT_DETECTIONS_TYPES } from '@rfcx-bio/common/api-bio/cnn/export-detections'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { exportDetections } from './export-detections-bll'

export const exportDetectionsHandler: Handler<string, ExportDetectionsParams, unknown, ExportDetectionsBody> = async (req, rep) => {
  const jobIdInt = Number(req.params.jobId)

  if (Number.isNaN(jobIdInt)) {
    throw BioInvalidPathParamError({ jobId: jobIdInt })
  }

  const email = req?.userToken?.email ?? ''

  if (req.body.types.length === 0) {
    req.body.types = [...EXPORT_DETECTIONS_TYPES]
  }

  await exportDetections(
    jobIdInt,
    req.body.types,
    email
  )
  void rep.code(201)
  return ''
}
