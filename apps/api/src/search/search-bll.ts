import { Op } from 'sequelize'

import { type SearchResponse, type SearchType } from '@rfcx-bio/common/api-bio/search/search'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'
import { env } from '~/env'

const localSearchDatabase = async (type: SearchType, query: string | undefined, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  const sequelize = getSequelize()
  const { LocationProject, ProjectVersion, LocationProjectMetric, LocationProjectProfile, LocationProjectCountry } = ModelRepository.getInstance(sequelize)

  if (query === undefined || query === '') {
    return {
      total: 0,
      data: []
    }
  }

  const response = await LocationProject.findAll({
    where: {
      latitudeNorth: {
        [Op.ne]: 0
      },
      latitudeSouth: {
        [Op.ne]: 0
      },
      longitudeEast: {
        [Op.ne]: 0
      },
      longitudeWest: {
        [Op.ne]: 0
      },
      name: {
        [Op.iLike]: query
      }
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
      },
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

  console.info(response)

  return {
    total: 0,
    data: []
  }

  // return {
  //   total: 0,
  //   data: response.map(res => {
  //     return {
  //       type: 'project',
  //       avgLatitude: getAverageCoordinate(res.latitudeNorth, res.latitudeSouth),
  //       avgLongitude: getAverageCoordinate(res.longitudeEast, res.longitudeWest),
  //       id: res.id,
  //       idCore: res.idCore,
  //       idArbimon: res.idArbimon,
  //       name: res.name,
  //       slug: res.slug,
  //       image: res.LocationProjectProfile.image,
  //       objectives: res.LocationProjectProfile.objectives,
  //       summary: res.LocationProjectProfile.summary,
  //       speciesCount: res.LocationProjectMetric.speciesCount,
  //       recordingMinutesCount: res.LocationProjectMetric.recordingMinutesCount,
  //       countryCodes: res.LocationProjectCountry.countryCodes
  //     }
  //   })
  // }
}

const opensearchSearchDatabase = async (type: SearchType, query: string | undefined, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  // TODO: the actual oopensearch stuff
  return {
    total: 0,
    data: []
  }
}

export const searchDatabase = env.OPENSEARCH_ENABLED === 'true' ? opensearchSearchDatabase : localSearchDatabase
