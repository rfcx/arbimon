import type { LocationProjectProfile, Project } from '@rfcx-bio/common/dao/types'

export type ProjectProfileWithMetrics = Omit<Project, 'createdAt' | 'updatedAt' | 'idCore' | 'idArbimon'> & Pick<LocationProjectProfile, 'summary' | 'objectives' > & {
  noOfRecordings: number
  noOfSpecies: number
  countries: string[]
  // TODO: add if highlighted project
}
