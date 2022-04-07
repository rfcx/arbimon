import { Source } from '@/dao/types'

const masterSources = <const>[
  { id: 100, name: 'Arbimon Validated' }
]

export type SourceId = typeof masterSources[number]['id']
export const sources: readonly Source[] = masterSources
