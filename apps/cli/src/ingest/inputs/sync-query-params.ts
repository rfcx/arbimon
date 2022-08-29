import { SyncStatus } from '@rfcx-bio/common/dao/types'

export type SyncQueryParams = Pick<SyncStatus, 'syncUntilDate' | 'syncUntilId' | 'syncBatchLimit' | 'projectId'>
