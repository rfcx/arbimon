import type { ProjectProfileWithMetrics } from './types'

export const rawDirectoryProjectsData: ProjectProfileWithMetrics[] = [
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
  countries: ['US']
},
{
  id: 2,
  name: 'BCI-Panama_2018',
  slug: 'bci-panama-2018',
  latitudeNorth: 18.51375,
  latitudeSouth: 17.93168,
  longitudeEast: -65.24505,
  longitudeWest: -67.94469784,
  summary: 'This is a project of Marconi Campos-Cerqueira. The objective is to record anurans, birds, and bats during the transition between the dry and wet seasons.',
  objectives: [],
  noOfSpecies: 0,
  noOfRecordings: 0,
  countries: []
},
{
  id: 3,
  name: 'Fake Project',
  slug: 'fake-arbimon-project-for-bio',
  latitudeNorth: 18.51375,
  latitudeSouth: 17.93168,
  longitudeEast: -65.24505,
  longitudeWest: -67.94469784,
  summary: 'This is a test project!',
  objectives: ['Test objective 1', 'Test objective 2'],
  noOfSpecies: 0,
  noOfRecordings: 0,
  countries: []
}
]
