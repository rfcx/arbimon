import { Source } from '@/dao/types'

export const masterSources = <const>{
  ArbimonValidated: { id: 100, name: 'Arbimon Validated' }
}

export type SourceId = typeof masterSources[keyof typeof masterSources]['id']
export const sources: readonly Source[] = Object.values(masterSources)
