import type { LocationProjectProfile, Project } from '@rfcx-bio/common/dao/types'

export type ProjectLight = Pick<Project, 'id' | 'slug' | 'name'> & {
  avgLatitude: number
  avgLongitude: number
  isHighlighted: boolean
  isMock: boolean // TODO: remove this
}

export type ProjectProfileWithMetrics = ProjectLight & Pick<LocationProjectProfile, 'summary' | 'objectives' > & {
  noOfRecordings: number
  noOfSpecies: number
  countries: string[]
  imageUrl: string
}
