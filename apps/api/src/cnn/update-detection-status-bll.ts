import dayjs from 'dayjs'

import { type ArbimonReviewStatus, type CoreReviewStatus, ARBIMON_CORE_REVIEW_STATUS_MAP } from '@rfcx-bio/common/api-bio/cnn/classifier-job-information'
import { type UpdateDetectionStatusBody, type UpdateDetectionStatusResponseBody, validReviewStatus } from '@rfcx-bio/common/api-bio/cnn/reviews'

import { updateDetectionStatus as coreUpdateDetectionStatus } from '~/api-core/api-core'
import { BioInvalidBodyError } from '~/errors'

const getArbimonReviewStatus = (status: CoreReviewStatus): ArbimonReviewStatus => {
  if (status === 'unreviewed') { return 'unvalidated' }
  if (status === 'rejected') { return 'notPresent' }
  if (status === 'uncertain') { return 'unknown' }
  if (status === 'confirmed') { return 'present' }
  return 'unvalidated'
}

export const updateDetectionStatus = async (token: string, body: UpdateDetectionStatusBody): Promise<UpdateDetectionStatusResponseBody> => {
  if (body?.start === undefined || body.start === '' || !dayjs(body.start).isValid()) {
    throw BioInvalidBodyError({ start: body?.start })
  }

  // @ts-expect-error we still have to check for possible empty string here.
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions -- the `body.status` is a union, the cast did not work
  if (body?.status === undefined || body.status === '' || !validReviewStatus.includes(body.status)) {
    throw BioInvalidBodyError({ status: body?.status })
  }

  if (body?.classificationValue === undefined || body.classificationValue === '') {
    throw BioInvalidBodyError({ classificationValue: body?.classificationValue })
  }

  if (body?.jobId === undefined || Number.isNaN(Number(body.jobId))) {
    throw BioInvalidBodyError({ jobId: body?.jobId })
  }

  if (body?.siteIdCore === undefined || body.siteIdCore === '') {
    throw BioInvalidBodyError({ siteIdCore: body?.siteIdCore })
  }

  if (body?.classifierId === undefined || Number.isNaN(Number(body.classifierId))) {
    throw BioInvalidBodyError({ classifierId: body?.classifierId })
  }

  const response = await coreUpdateDetectionStatus(
    token,
    {
      status: ARBIMON_CORE_REVIEW_STATUS_MAP[body.status],
      classifier: body.classifierId,
      classification: body.classificationValue,
      classifier_job: body.jobId
    },
    {
      stream_id: body.siteIdCore,
      start: body.start
    }
  )

  return response.map(r => ({
    id: Number(r.id),
    status: getArbimonReviewStatus(r.status)
  }))
}
