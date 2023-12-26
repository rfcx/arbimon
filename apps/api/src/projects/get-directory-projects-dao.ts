import { readFileSync } from 'fs'
import { resolve } from 'path'
import { type Optional, Op } from 'sequelize'

import { type DirectoryProjectsResponse, type ProjectLight, type ProjectProfileWithMetrics } from '@rfcx-bio/common/api-bio/project/projects'
import { type ModelForInterfaceWithPk } from '@rfcx-bio/common/dao/model-factory-helpers/defaults'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type Project } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'

const avgCoordinate = (x: number, y: number): number => {
  if (x === y) return x
  return (x + y) / 2
}

interface ProjectRaw {
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

export const toLightProjectsFromProjects = (projects: Project[]): ProjectLight[] => {
  return projects.map((project) => ({
    id: Number(project.id),
    name: project.name,
    slug: project.slug,
    avgLatitude: avgCoordinate(project.latitudeNorth, project.latitudeSouth),
    avgLongitude: avgCoordinate(project.longitudeEast, project.longitudeWest),
    isHighlighted: true,
    isMock: false
  }))
}

export const getDirectoryProjects = (fullVersion: boolean = false, ids: number[] = [], keywords: string[]): DirectoryProjectsResponse => {
  const path = resolve('./public/directory/data-testing.json')
  const jsonData = JSON.parse(readFileSync(path, 'utf8'))
  const projects = jsonData.data.map((p: ProjectRaw): ProjectProfileWithMetrics => ({
    id: Number(p.id),
    name: p.name,
    slug: p.slug,
    avgLatitude: avgCoordinate(p.latitude_north, p.latitude_south),
    avgLongitude: avgCoordinate(p.longitude_east, p.longitude_west),
    summary: p.summary ?? '',
    objectives: [],
    noOfSpecies: p.species_count ?? 0,
    noOfRecordings: p.recording_minutes_count ?? 0,
    countries: [],
    isHighlighted: true,
    isMock: true,
    isPublished: true,
    imageUrl: p.image
  }))
  const filteredProjects = projects.filter((p: ProjectProfileWithMetrics) => {
    if (ids.length > 0) {
      return ids.includes(p.id)
    }
    if (keywords.length > 0) {
      return keywords.some((keyword) => p.name.toLowerCase().includes(keyword.toLowerCase())) || keywords.some((keyword) => p.summary.toLowerCase().includes(keyword.toLowerCase())) || keywords.some((keyword) => p.objectives.some((objective) => objective.toLowerCase().includes(keyword.toLowerCase())))
    }
    return true
  })
  return !fullVersion ? toLightProjects(filteredProjects) : filteredProjects
}

export const queryDirectoryProjects = async (fullVersion: boolean = false, ids: number[] = [], keywords: string[]): Promise<DirectoryProjectsResponse> => {
  const sequelize = getSequelize()
  const { LocationProject, LocationProjectMetric, LocationProjectCountry, LocationProjectProfile, ProjectVersion } = ModelRepository.getInstance(sequelize)

  // form where clauses
  const whereKeywords = keywords.length === 0
? {}
: {
    name: {
      [Op.iLike]: {
        [Op.any]: keywords.map((keyword) => `%${keyword}%`)
      }
    }
  }

  const whereIds = ids.length === 0 ? {} : { id: { [Op.in]: ids } }

  // query
  const projects = await LocationProject.findAll({
    where: {
      latitudeNorth: { [Op.ne]: 0 },
      latitudeSouth: { [Op.ne]: 0 },
      longitudeEast: { [Op.ne]: 0 },
      longitudeWest: { [Op.ne]: 0 },
      ...whereKeywords,
      ...whereIds
    },
    include: [
      {
        model: ProjectVersion,
        attributes: ['is_public', 'is_published'],
        where: {
          [Op.or]: [
            { is_public: true },
            { is_published: true }
          ]
        }
      }
    ],
    raw: true
  }) as Array<ModelForInterfaceWithPk<Project, Optional<Project, 'id'>> & { 'ProjectVersion.is_published': boolean }>
  if (!fullVersion) {
    return toLightProjectsFromProjects(projects)
  } else {
    // TODO: add where clauses for metrics, countries, profiles
    const whereLocationProjectIds = ids.length === 0 ? {} : { locationProjectId: { [Op.in]: ids } }
    const profiles = await LocationProjectProfile.findAll({ where: { ...whereLocationProjectIds }, raw: true })
    const metrics = await LocationProjectMetric.findAll({ where: { ...whereLocationProjectIds }, raw: true })
    const countries = await LocationProjectCountry.findAll({ where: { ...whereLocationProjectIds }, raw: true })
    return projects.map((project) => ({
      id: Number(project.id),
      name: project.name,
      slug: project.slug,
      avgLatitude: avgCoordinate(project.latitudeNorth, project.latitudeSouth),
      avgLongitude: avgCoordinate(project.longitudeEast, project.longitudeWest),
      summary: profiles.find(p => p.locationProjectId === project.id)?.summary ?? '',
      objectives: profiles.find(p => p.locationProjectId === project.id)?.objectives ?? [],
      noOfSpecies: metrics.find(p => p.locationProjectId === project.id)?.speciesCount ?? 0,
      noOfRecordings: metrics.find(p => p.locationProjectId === project.id)?.recordingMinutesCount ?? 0,
      countries: countries.find(p => p.locationProjectId === project.id)?.countryCodes ?? [],
      isPublished: project['ProjectVersion.is_published'] ?? false,
      isHighlighted: true,
      isMock: false,
      imageUrl: profiles.find(p => p.locationProjectId === project.id)?.image
    }))
  }
}
