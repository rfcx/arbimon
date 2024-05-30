import { createJob } from '@rfcx-bio/node-common/kubernetes'
import { syncJob } from '@rfcx-bio/node-common/kubernetes/job'

import { env } from '~/env'

export const startSync = async (projectId: number): Promise<void> => {
  const job = syncJob(`arbimon-sync-fix-project-${projectId}`, projectId)
  await createJob(job, env.KUBERNETES_NAMESPACE ?? 'testing')
}
