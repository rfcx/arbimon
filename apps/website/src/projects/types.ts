import { type ProjectObjective as ProjectObjectiveShared } from '@rfcx-bio/common/dao/types'

export interface Analysis {
  value: string
  title: string
  iconName: string
  count: number | undefined
  isLoading: boolean
  label: string
  speciesTitle?: string
  speciesDetected?: number
  link: string
}

export interface AnalysisCard {
  value: string
  title: string
  description: string
  link: string
  url: string
  label: string
  isSelected: boolean
}

export interface Stat {
  value: string
  title: string
  description: string
  count: number | undefined
  isLoading: boolean
  label: string
  link: string
}

export interface ProjectDefault {
  name: string
  startDate: string | null
  endDate: string | null
  onGoing: boolean
}

export type ProjectObjective = ProjectObjectiveShared

export const masterOjectiveTypes = {
  BioBaseline: { id: 100, slug: 'bio-baseline', description: 'Establish biodiversity baseline', shorten: 'Establish baseline', imageUrl: 'https://github.com/rfcx/arbimon/assets/9149523/37e29356-c09c-40d3-aa70-e2200c251e71' },
  MonitorSpecies: { id: 200, slug: 'monitor-species', description: 'Detect / monitor endangered species', shorten: 'Detect rare species', imageUrl: 'https://github.com/rfcx/arbimon/assets/9149523/1ae1f266-c609-4b7a-bf88-669997cb29c4' },
  MonitorIllegalAct: { id: 300, slug: 'monitor-illegal-act', description: 'Detect and monitor illegal activity', shorten: 'Detect illegal activity', imageUrl: 'https://github.com/rfcx/arbimon/assets/9149523/6804ddd5-df4f-484a-821a-46d62252128f' },
  ImpactHuman: { id: 400, slug: 'impact-human', description: 'Evaluate impact of human activities on biodiversity', shorten: 'Evaluate human impact', imageUrl: 'https://github.com/rfcx/arbimon/assets/9149523/d2be14de-d4f9-40cb-8022-6f02ef6b81c5' },
  ImpactConservation: { id: 500, slug: 'impact-conservation', description: 'Evaluate impact of conservation initiatives on biodiversity', shorten: 'Evaluate conservation impact', imageUrl: 'https://github.com/rfcx/arbimon/assets/9149523/5e5ac395-6272-4499-9ae8-ea1021147ba7' },
  Others: { id: 999, slug: 'others', description: 'Others', shorten: 'Others', imageUrl: 'https://github.com/rfcx/arbimon/assets/9149523/14812747-f5a7-4b2f-95c9-257658e139a9' }
} as const

export const objectiveTypes: readonly ProjectObjective[] = Object.values(masterOjectiveTypes)
