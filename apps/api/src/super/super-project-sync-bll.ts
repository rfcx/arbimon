import { createJob } from '@rfcx-bio/node-common/kubernetes'
import { syncJob } from '@rfcx-bio/node-common/kubernetes/job'

export const startSync = async (projectId: number): Promise<void> => {
  const job = syncJob(`arbimon-sync-fix-project-${projectId}`, projectId)
  await createJob(job)
}
