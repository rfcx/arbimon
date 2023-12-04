import { rawAllProjects } from './rawAllProject'
import type { ProjectLight, ProjectProfileWithMetrics } from './types'

export const avgCoordinate = (x: number, y: number): number => {
  if (x === y) return x
  return (x + y) / 2
}

export const rawDirectoryProjectsData: ProjectProfileWithMetrics[] = [
  ...rawAllProjects.filter((p) => {
    const hasNosite = p.longitude_east === 0 && p.longitude_west === 0 && p.latitude_north === 0 && p.latitude_south === 0
    return !hasNosite
  }).map((project) => ({
    id: project.id,
    name: project.name,
    slug: project.slug,
    avgLatitude: avgCoordinate(project.latitude_north, project.latitude_south),
    avgLongitude: avgCoordinate(project.longitude_west, project.longitude_east),
    summary: 'This is a test project!',
    objectives: ['Test objective 1'],
    noOfSpecies: 0,
    noOfRecordings: 0,
    countries: [],
    isHighlighted: false,
    isMock: true
  }))
]

export const rawLightDirectoryProjectsData: ProjectLight[] = rawDirectoryProjectsData.map((project) => ({
  id: project.id,
  name: project.name,
  slug: project.slug,
  avgLatitude: project.avgLatitude,
  avgLongitude: project.avgLongitude
}))
