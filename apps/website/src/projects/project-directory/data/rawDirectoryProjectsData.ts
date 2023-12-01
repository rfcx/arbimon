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
    isHighlighted: false
  })),
  {
    id: 1,
    name: 'Puerto Rico',
    slug: 'puerto-rico',
    latitudeNorth: 18.51375,
    latitudeSouth: 17.93168,
    longitudeEast: -65.24505,
    longitudeWest: -67.94469784,
    summary: 'Acoustic monitoring and occupancy maps for bird and anuran species across Puerto Rico: A baseline for SWAP and other agencies’ conservation and planning activities',
    objectives: ['monitor-species', 'impact-human', 'blagh'],
    noOfSpecies: 12,
    noOfRecordings: 167,
    countries: ['US'],
    isHighlighted: true
  },
  {
    id: 2,
    name: 'BCI-Panama_2018',
    slug: 'bci-panama-2018',
    latitudeNorth: 9.17229,
    latitudeSouth: 9.14041,
    longitudeEast: -79.81971,
    longitudeWest: -79.86858,
    summary: 'This is a project of Marconi Campos-Cerqueira. The objective is to record anurans, birds, and bats during the transition between the dry and wet seasons.',
    objectives: [],
    noOfSpecies: 0,
    noOfRecordings: 0,
    countries: [],
    isHighlighted: true
  },
  {
    id: 3,
    name: 'Fake Project',
    slug: 'fake-arbimon-project-for-bio',
    latitudeNorth: 12.0,
    latitudeSouth: 11.9,
    longitudeEast: -55.0,
    longitudeWest: -55.14,
    summary: 'This is a test project!',
    objectives: ['Test objective 1', 'Test objective 2'],
    noOfSpecies: 0,
    noOfRecordings: 0,
    countries: [],
    isHighlighted: true
  }
]
