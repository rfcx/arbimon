import { ValueOf } from '@rfcx-bio/utils/utility-types'

import { Source } from '@/dao/types'

export const masterSources = <const>{
  ArbimonValidated: { id: 100, name: 'Arbimon Validated' }
}

export type SourceId = ValueOf<typeof masterSources>['id']
export const sources: readonly Source[] = Object.values(masterSources)
