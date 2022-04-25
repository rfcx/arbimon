import { Op } from 'sequelize'

import { LocationProjectForUser } from '@rfcx-bio/common/api-bio/common/projects'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { ATTRIBUTES_LOCATION_PROJECT } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'

export const getMemberProjects = async (memberProjectCoreIds: string[]): Promise<LocationProjectForUser[]> => {
  const models = ModelRepository.getInstance(getSequelize())

  const projects = memberProjectCoreIds.length === 0
    ? []
    : await models.LocationProject
      .findAll({
        order: ['name'],
        where: { idCore: memberProjectCoreIds },
        attributes: ATTRIBUTES_LOCATION_PROJECT.light,
        raw: true
      })

  // Temporarily hard-code public projects
  // TODO: Remove this hack & use ProjectVersion data
  const publicSlugs = [
    'bci-panama-2018',
    'birds-of-madeira-flooded-habitats',
    'las-balsas-jocotoco-foundation-project',
    'puerto-rico',
    'puerto-rico-island-wide',
    'rfcx-guardians-madre-de-dios-peru'
  ]

  const myProjectIds = projects.map(p => p.id)
  const publicProjects = await models.LocationProject
    .findAll({
      where: {
        id: { [Op.notIn]: myProjectIds },
        slug: publicSlugs
      },
      attributes: ATTRIBUTES_LOCATION_PROJECT.light,
      raw: true
    })

  return [
    ...projects.map(p => ({
      ...p,
      isMyProject: true,
      hasPublishedVersions: publicSlugs.includes(p.slug),
      hasPublicVersions: publicSlugs.includes(p.slug)
    })),
    ...publicProjects.map(p => ({
      ...p,
      isMyProject: false,
      hasPublishedVersions: true,
      hasPublicVersions: true
    }))
  ]
}
