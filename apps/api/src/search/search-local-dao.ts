import { Op } from 'sequelize'

import { type SearchResponse } from '@rfcx-bio/common/api-bio/search/search'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'
import { fileUrl } from '~/format-helpers/file-url'
import { getAverageCoordinate } from './helpers'

export const getProjectsByQuery = async (query: string, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  const sequelize = getSequelize()
  const { LocationProject, LocationProjectMetric, LocationProjectProfile, LocationProjectCountry } = ModelRepository.getInstance(sequelize)

  const results = await LocationProject.findAll({
    where: {
      name: {
        [Op.iLike]: `%${query}%`
      },
      status: ['listed', 'published']
    },
    limit,
    offset,
    include: [
      {
        model: LocationProjectMetric,
        as: 'LocationProjectMetric'
      },
      {
        model: LocationProjectProfile,
        as: 'LocationProjectProfile'
      },
      {
        model: LocationProjectCountry,
        as: 'LocationProjectCountry'
      }
    ]
  })

  return {
    total: results.length,
    data: results.map(result => {
      // @ts-expect-error Sequelize types don't know about includes
      const { LocationProjectProfile: profile, LocationProjectMetric: metric, LocationProjectCountry: country, ...project } = result.toJSON()
      return {
        type: 'project',
        avgLatitude: getAverageCoordinate(project.latitudeNorth, project.latitudeSouth),
        avgLongitude: getAverageCoordinate(project.longitudeEast, project.longitudeWest),
        id: project.id,
        idCore: project.idCore,
        idArbimon: project.idArbimon,
        name: project.name,
        slug: project.slug,
        status: project.status,
        image: profile?.image ?? '',
        objectives: profile?.objectives ?? '',
        summary: profile?.summary ?? '',
        speciesCount: metric?.speciesCount ?? 0,
        recordingMinutesCount: metric?.recordingMinutesCount ?? 0,
        countryCodes: country?.countryCodes ?? []
      }
    })
  }
}

export const getTrendingProjects = async (limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  const sequelize = getSequelize()
  const { LocationProject, LocationProjectMetric, LocationProjectProfile, LocationProjectCountry } = ModelRepository.getInstance(sequelize)

  const results = await LocationProject.findAndCountAll({
    where: {
      status: ['listed', 'published']
    },
    limit,
    offset,
    include: [
      {
        model: LocationProjectMetric,
        as: 'LocationProjectMetric'
      },
      {
        model: LocationProjectProfile,
        as: 'LocationProjectProfile'
      },
      {
        model: LocationProjectCountry,
        as: 'LocationProjectCountry'
      }
    ],
    order: [
      [LocationProjectMetric, 'recordingMinutesCount', 'DESC']
    ]
  })

  return {
    total: results.count,
    data: results.rows.map(result => {
      // @ts-expect-error this sequelize won't know of these existence
      const { LocationProjectMetric: metric, LocationProjectProfile: profile, LocationProjectCountry: country, ...project } = result.toJSON()
      return {
        type: 'project',
        avgLatitude: getAverageCoordinate(project.latitudeNorth, project.latitudeSouth),
        avgLongitude: getAverageCoordinate(project.longitudeEast, project.longitudeWest),
        id: project.id,
        idCore: project.idCore,
        idArbimon: project.idArbimon,
        name: project.name,
        slug: project.slug,
        status: project.status,
        image: fileUrl(project?.image) ?? '',
        objectives: profile?.objectives ?? '',
        summary: profile?.summary ?? '',
        speciesCount: metric?.speciesCount ?? 0,
        recordingMinutesCount: metric?.recordingMinutesCount ?? 0,
        countryCodes: country?.countryCodes ?? []
      }
    })
  }
}
