import { readFileSync } from 'fs'
import { resolve } from 'path'

import { type DirectoryProjectsResponse, type ProjectLight, type ProjectProfileWithMetrics } from '@rfcx-bio/common/api-bio/project/projects'

const avgCoordinate = (x: number, y: number): number => {
  if (x === y) return x
  return (x + y) / 2
}

interface Project {
  id: string
  name: string
  slug: string
  latitude_north: number
  latitude_south: number
  longitude_east: number
  longitude_west: number
  summary: string
  objectives: string[]
  species_count: number
  recording_minutes_count: number
  countries: string[]
  image: string
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

export const getDirectoryProjects = (isLight: boolean = false, ids: number[] = [], keywords: string[]): DirectoryProjectsResponse => {
  console.info('getDirectoryProjects', { isLight, ids, keywords })
  const path = resolve('./public/directory/data-local.json')
  const jsonData = JSON.parse(readFileSync(path, 'utf8'))
  const projects = jsonData.data.map((p: Project): ProjectProfileWithMetrics => ({
    id: Number(p.id),
    name: p.name,
    slug: p.slug,
    avgLatitude: avgCoordinate(p.latitude_north, p.latitude_south),
    avgLongitude: avgCoordinate(p.longitude_east, p.longitude_west),
    summary: p.summary,
    objectives: p.objectives,
    noOfSpecies: p.species_count ?? 0,
    noOfRecordings: p.recording_minutes_count ?? 0,
    countries: p.countries,
    isHighlighted: true,
    isMock: false,
    imageUrl: p.image
  }))
  const filteredProjects = projects.filter((p: ProjectProfileWithMetrics) => {
    if (ids.length > 0) {
      return ids.map(id => Number(id)).includes(p.id)
    }
    if (keywords.length > 0) {
      return keywords.some((keyword) => p.name.toLowerCase().includes(keyword.toLowerCase()))
    }
    return true
  })
  return isLight ? toLightProjects(filteredProjects) : filteredProjects
}
