import { createJob } from '@rfcx-bio/node-common/kubernetes'
import { syncJob } from '@rfcx-bio/node-common/kubernetes/job'

import { getProjectArbimonId } from '@/projects/dao/projects-dao'
import { BioNotFoundError } from '~/errors'

export const startSync = async (projectId: number): Promise<void> => {
  const projectIdArbimon = await getProjectArbimonId(projectId)

  if (projectIdArbimon === undefined) throw BioNotFoundError()

  await createJob(syncJob(`arbimon-sync-project-${projectId}`, projectIdArbimon))
}
