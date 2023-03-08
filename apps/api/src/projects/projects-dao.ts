import { Op } from 'sequelize'

import { type LocationProjectForUser } from '@rfcx-bio/common/api-bio/project/projects'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ATTRIBUTES_LOCATION_PROJECT } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'

export const getViewableProjects = async (memberProjectCoreIds: string[]): Promise<LocationProjectForUser[]> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  // Temporarily hard-code showcase projects
  const showcaseSlugs = [
    'bci-panama-2018',
    'birds-of-madeira-flooded-habitats',
    'las-balsas-jocotoco-foundation-project',
    'puerto-rico',
    'puerto-rico-island-wide',
    'rfcx-guardians-madre-de-dios-peru',
    'weforest-wildlife-corridors',
    'mangrove-finch-galapagos',
    'coal-road-hutan-harapan-p4f',
    'hutan-indo',
    'cratere-degli-astroni-rns',
    'tech4nature-mexico',
    'similajau'
  ]

  const projects = await models.LocationProject
    .findAll({
      where: {
        [Op.or]: [
          { idCore: memberProjectCoreIds },
          { id: { [Op.in]: sequelize.literal('(SELECT location_project_id FROM project_version WHERE is_public = true)') } }
        ]
      },
      attributes: ATTRIBUTES_LOCATION_PROJECT.light,
      order: ['name'],
      raw: true
    })

  return projects.map(p => ({
      ...p,
      isMyProject: memberProjectCoreIds.includes(p.idCore),
      isShowcaseProject: showcaseSlugs.includes(p.slug)
    }))
}
