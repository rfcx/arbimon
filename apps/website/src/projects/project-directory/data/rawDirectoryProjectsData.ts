import { rawAllProjects } from './rawAllProject'
import type { ProjectProfileWithMetrics } from './types'

export const rawDirectoryProjectsData: ProjectProfileWithMetrics[] = [
  ...rawAllProjects.filter((p) => {
    const hasNosite = p.longitude_east === 0 && p.longitude_west === 0 && p.latitude_north === 0 && p.latitude_south === 0
    return !hasNosite
  }).map((project) => ({
    id: project.id,
    name: project.name,
    slug: project.slug,
    latitudeNorth: project.latitude_north,
    latitudeSouth: project.latitude_south,
    longitudeEast: project.longitude_east,
    longitudeWest: project.longitude_west,
    summary: 'This is a test project!',
    objectives: ['Test objective 1'],
    noOfSpecies: 0,
    noOfRecordings: 0,
    countries: [],
    isHighlighted: false,
    isMock: true
  }))
]
