import { Op } from 'sequelize'

import { LocationProjectForUser } from '@rfcx-bio/common/api-bio/project/projects'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ATTRIBUTES_LOCATION_PROJECT } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'

export const getMemberProjects = async (memberProjectCoreIds: string[]): Promise<LocationProjectForUser[]> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  const projects = memberProjectCoreIds.length === 0
    ? []
    : await models.LocationProject
      .findAll({
        order: ['name'],
        where: { idCore: memberProjectCoreIds },
        attributes: ATTRIBUTES_LOCATION_PROJECT.light,
        raw: true
      })
  const myProjectIds = projects.map(p => p.id)

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

  const publicProjects = await models.LocationProject
    .findAll({
      where: {
        [Op.and]: [
          { id: { [Op.notIn]: myProjectIds } },
          { id: { [Op.in]: sequelize.literal('(SELECT location_project_id FROM project_version WHERE is_public = true)') } }
        ]
      },
      attributes: ATTRIBUTES_LOCATION_PROJECT.light,
      raw: true
    })
  const publicSlugs = publicProjects.map(p => p.slug)

  return [
    ...projects.map(p => ({
      ...p,
      isMyProject: true,
      hasPublishedVersions: showcaseSlugs.includes(p.slug),
      hasPublicVersions: publicSlugs.includes(p.slug)
    })),
    ...publicProjects.map(p => ({
      ...p,
      isMyProject: false,
      hasPublishedVersions: showcaseSlugs.includes(p.slug),
      hasPublicVersions: true
    }))
  ]
}
