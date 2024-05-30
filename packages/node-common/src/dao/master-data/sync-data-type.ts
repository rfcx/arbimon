import { type ValueOf } from '@rfcx-bio/utils/utility-types'

import { type SyncDataType } from '../types'

export const masterSyncDataTypes = {
  Project: { id: 100, name: 'Project' },
  Site: { id: 200, name: 'Site' },
  Species: { id: 300, name: 'Species' },
  SpeciesCall: { id: 400, name: 'Species Call' },
  Recording: { id: 500, name: 'Recording' },
  Detection: { id: 600, name: 'Detection' },
  RecordingDeleted: { id: 700, name: 'Recording Deleted' },
  Opensearch: { id: 800, name: 'Opensearch' }
} as const

export type SyncTypesId = ValueOf<typeof masterSyncDataTypes>['id']
export const syncTypes: readonly SyncDataType[] = Object.values(masterSyncDataTypes)
