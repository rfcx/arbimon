import { type Order, type WhereOptions, Op } from 'sequelize'

import { type SearchResponse } from '@rfcx-bio/common/api-bio/search/search'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type Project } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '~/db'
import { fileUrl } from '~/format-helpers/file-url'
import { getAverageCoordinate } from './helpers'

export const getProjectsByQuery = async (keyword?: string, status?: string, limit?: number, offset?: number, order?: Order): Promise<{ total: number, data: SearchResponse }> => {
  const sequelize = getSequelize()
  const { LocationProject, LocationProjectMetric, LocationProjectProfile, LocationProjectCountry } = ModelRepository.getInstance(sequelize)

  const whereOptional: WhereOptions<Project> = {}
  if (keyword) {
    whereOptional.name = {
      [Op.iLike]: `%${keyword}%`
    }
  }

  if (status === 'published') {
    whereOptional.status = status
  } else {
    whereOptional.status = { [Op.in]: ['listed', 'published'] }
  }

  const results = await LocationProject.findAll({
    where: {
      ...whereOptional
    },
    order: order !== undefined ? order : sequelize.literal('"status" DESC, "LocationProjectMetric.speciesCount" DESC'),
    limit: limit !== undefined ? limit : 20,
    offset: offset !== undefined ? offset : 0,
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
        image: fileUrl(profile?.image) ?? '',
        thumbnail: fileUrl(profile?.image, 'thumbnail') ?? '',
        objectives: profile?.objectives ?? [],
        summary: profile?.summary ?? '',
        readme: profile?.readme ?? '',
        speciesCount: metric?.speciesCount ?? 0,
        recordingMinutesCount: metric?.recordingMinutesCount ?? 0,
        countryCodes: country?.countryCodes ?? []
      }
    })
  }
}
