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
  startDate: string
  endDate: string | null
}

export interface ProjectObjective {
  id: number
  slug: string
  description: string
}

export const masterOjectiveTypes = {
  BioBaseline: { id: 100, slug: 'bio-baseline', description: 'Establish baseline biodiversity' },
  MonitorSpecies: { id: 200, slug: 'monitor-species', description: 'Detect / monitor endangered species' },
  MonitorIllegalAct: { id: 300, slug: 'monitor-illegal-act', description: 'Detect and monitor illegal activity' },
  ImpactHuman: { id: 400, slug: 'impact-human', description: 'Evaluate impact of human activities on biodiversity' },
  ImpactConservation: { id: 500, slug: 'impact-conservation', description: 'Evaluate impact of conservation initiatives on biodiversity' },
  Others: { id: 999, slug: 'others', description: 'Others' }
} as const

export const objectiveTypes: readonly ProjectObjective[] = Object.values(masterOjectiveTypes)
