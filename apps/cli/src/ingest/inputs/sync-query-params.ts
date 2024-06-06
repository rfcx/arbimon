import { type SyncStatus } from '@rfcx-bio/node-common/dao/types'

export type SyncQueryParams = Pick<SyncStatus, 'syncUntilDate' | 'syncUntilId' | 'syncBatchLimit'>
