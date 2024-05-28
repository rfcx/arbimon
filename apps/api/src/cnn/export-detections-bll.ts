import { type ExportDetectionsType } from '@rfcx-bio/common/api-bio/cnn/export-detections'
import { createJob } from '@rfcx-bio/node-common/kubernetes'
import { exportDetectionsJob } from '@rfcx-bio/node-common/kubernetes/job'

export const exportDetections = async (jobId: number, types: ExportDetectionsType[], email: string): Promise<void> => {
  const job = exportDetectionsJob(`arbimon-export-detections-${jobId}`, jobId, types.join(','), email)
  await createJob(job)
}
