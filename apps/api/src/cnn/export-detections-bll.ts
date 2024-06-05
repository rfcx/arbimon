import { createHash } from 'node:crypto'

import { type ExportDetectionsType } from '@rfcx-bio/common/api-bio/cnn/export-detections'
import { createJob } from '@rfcx-bio/node-common/kubernetes'
import { exportDetectionsJob } from '@rfcx-bio/node-common/kubernetes/job'

import { env } from '~/env'

export const exportDetections = async (jobId: number, types: ExportDetectionsType[], email: string): Promise<void> => {
  const shasum = createHash('sha1')
  shasum.update(email)
  const hashString = shasum.digest('hex')

  // INFO: Get first 8 character of email hash (sha1) to allow multiple users to do an export at the same time.
  const job = exportDetectionsJob(`arbimon-export-detections-${jobId}-${hashString.substring(0, 8)}`, jobId, types.join(','), email)
  await createJob(job, env.KUBERNETES_NAMESPACE ?? 'testing')
}
