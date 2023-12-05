import type { Project } from '@rfcx-bio/common/dao/types'

import { rawAllProjects } from './rawAllProject'
import type { ProjectLight, ProjectProfileWithMetrics } from './types'

export const avgCoordinate = (x: number, y: number): number => {
  if (x === y) return x
  return (x + y) / 2
}

const mockDataProjects: ProjectProfileWithMetrics[] = [
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

const getMockDataWithRealProjects = (realProjects: Project[]): ProjectProfileWithMetrics[] => {
  const realLightProjects: ProjectProfileWithMetrics[] = realProjects.map(project => {
    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      avgLatitude: avgCoordinate(project.latitudeNorth, project.latitudeSouth),
      avgLongitude: avgCoordinate(project.longitudeEast, project.longitudeWest),
      summary: 'This is a real project!',
      objectives: ['bio-baseline'],
      noOfSpecies: 0,
      noOfRecordings: 0,
      countries: [],
      isHighlighted: true,
      isMock: false
     }
  })
  const mockWithoutDuplicateProjectIds = mockDataProjects.filter(mockProject => !realProjects.find(realProject => realProject.id === mockProject.id))
  return [...realLightProjects, ...mockWithoutDuplicateProjectIds].sort((a) => a.isHighlighted ? -1 : 1)
}

export const toLightProjects = (projects: ProjectProfileWithMetrics[]): ProjectLight[] => {
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    slug: project.slug,
    avgLatitude: project.avgLatitude,
    avgLongitude: project.avgLongitude,
    isHighlighted: project.isHighlighted,
    isMock: project.isMock
  }))
}

export const getRawDirectoryProjects = (projects: Project[]): ProjectProfileWithMetrics[] => {
  return getMockDataWithRealProjects(projects)
}
