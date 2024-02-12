import { type ValueOf } from '@rfcx-bio/utils/utility-types'

import { type SyncSource } from '../types'

export const masterSources = {
  Arbimon: { id: 100, name: 'Arbimon' },
  DetectionArbimonValidated: { id: 200, name: 'Arbimon Validated' },
  NewArbimon: { id: 300, name: 'New Arbimon' }
} as const

export type SyncSourceId = ValueOf<typeof masterSources>['id']
export const sources: readonly SyncSource[] = Object.values(masterSources)
