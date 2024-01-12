import { Op } from 'sequelize'

import { type SearchResponse } from '@rfcx-bio/common/api-bio/search/search'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'
import { getAverageCoordinate } from './helpers'

export const getProjectsByQuery = async (query: string, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  const sequelize = getSequelize()
  const { LocationProject, ProjectVersion, LocationProjectMetric, LocationProjectProfile, LocationProjectCountry } = ModelRepository.getInstance(sequelize)

  const response = await LocationProject.findAll({
    where: {
      name: {
        [Op.iLike]: `%${query}%`
      }
    },
    include: [
      {
        model: ProjectVersion,
        attributes: ['is_public', 'is_published'],
        required: true,
        where: {
          is_public: true
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

  return {
    total: response.length,
    data: response.map(res => {
      return {
        type: 'project',
        avgLatitude: getAverageCoordinate(res.latitudeNorth, res.latitudeSouth),
        avgLongitude: getAverageCoordinate(res.longitudeEast, res.longitudeWest),
        id: res.id,
        idCore: res.idCore,
        idArbimon: res.idArbimon,
        name: res.name,
        slug: res.slug,
        // @ts-expect-error shut up please i'm testing
        image: res.LocationProjectProfile?.image ?? '',
        // @ts-expect-error shut up please i'm testing
        objectives: res.LocationProjectProfile?.objectives ?? '',
        // @ts-expect-error shut up please i'm testing
        summary: res.LocationProjectProfile?.summary ?? '',
        // @ts-expect-error shut up please i'm testing
        speciesCount: res.LocationProjectMetric?.speciesCount ?? 0,
        // @ts-expect-error shut up please i'm testing
        recordingMinutesCount: res.LocationProjectMetric?.recordingMinutesCount ?? 0,
        // @ts-expect-error shut up please i'm testing
        countryCodes: res.LocationProjectCountry?.countryCodes ?? []
      }
    })
  }
}
