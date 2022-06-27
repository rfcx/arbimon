import { ValueOf } from '@rfcx-bio/utils/utility-types'

import { SyncSource } from '@/dao/types'

export const masterSources = {
  ArbimonValidated: { id: 100, name: 'Arbimon Validated' }
} as const

export type SourceId = ValueOf<typeof masterSources>['id']
export const sources: readonly SyncSource[] = Object.values(masterSources)
