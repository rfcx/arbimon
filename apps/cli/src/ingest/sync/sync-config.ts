import { SyncStatus } from '@rfcx-bio/common/dao/types'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

export type SyncConfig = Pick<SyncStatus, 'syncSourceId' | 'syncDataTypeId' | 'syncBatchLimit'>

export const getDefaultSyncStatus = (syncConfig: SyncConfig): SyncStatus =>
  ({
    ...syncConfig,
    syncUntilDate: dayjs('1980-01-01T00:00:00.000Z').toDate(),
    syncUntilId: '0'
  })
