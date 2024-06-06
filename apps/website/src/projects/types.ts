import { masterObjectiveTypes as masterObjectiveTypesShared } from '@rfcx-bio/common/dao/master-data'
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
  error?: boolean
  speciesDetectedError?: boolean
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

// TODO: Investigate why this is needed
export type ProjectObjective = ProjectObjectiveShared
export const masterObjectiveTypes = masterObjectiveTypesShared
