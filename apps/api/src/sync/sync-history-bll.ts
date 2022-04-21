import { SyncHistoryResponse } from '@rfcx-bio/common/api-bio/sync'

import { getSyncs } from '@/sync/sync-history-dao'

export const getSyncHistory = async (projectId: number): Promise<SyncHistoryResponse> => {
  const syncs = await getSyncs(projectId)

  return {
    syncs
  }
}
