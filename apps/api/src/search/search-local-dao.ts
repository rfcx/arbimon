import { Op } from 'sequelize'

import { type SearchResponse } from '@rfcx-bio/common/api-bio/search/search'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'
import { getAverageCoordinate } from './helpers'

export const getProjectsByQuery = async (query: string, limit: number, offset: number): Promise<{ total: number, data: SearchResponse }> => {
  const sequelize = getSequelize()
  const { LocationProject, ProjectVersion, LocationProjectMetric, LocationProjectProfile, LocationProjectCountry } = ModelRepository.getInstance(sequelize)

  const results = await LocationProject.findAll({
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
