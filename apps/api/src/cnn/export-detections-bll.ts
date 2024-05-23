import { createJob } from '@rfcx-bio/node-common/kubernetes'
import { exportDetectionsJob } from '@rfcx-bio/node-common/kubernetes/job'

export const exportDetections = async (jobId: number): Promise<void> => {
  const job = exportDetectionsJob(`arbimon-export-detections-${jobId}`, jobId)
  await createJob(job)
}
