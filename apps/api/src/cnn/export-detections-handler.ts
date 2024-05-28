import { type ExportDetectionsBody, type ExportDetectionsParams } from '@rfcx-bio/common/api-bio/cnn/export-detections'

import { type Handler } from '~/api-helpers/types'
import { exportDetections } from './export-detections-bll'

export const exportDetectionsHandler: Handler<string, ExportDetectionsParams, unknown, ExportDetectionsBody> = async (req, rep) => {
  const email = req?.userToken?.email ?? ''

  await exportDetections(Number(req.params.jobId), req.body.types, email)
  void rep.code(201)
  return ''
}
