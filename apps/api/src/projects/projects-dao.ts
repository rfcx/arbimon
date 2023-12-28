import { Op } from 'sequelize'

import { type LocationProjectForUser, type MyProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type Project, ATTRIBUTES_LOCATION_PROJECT, LocationProjectProfile } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'
import { getImageUrl } from '@/users/helpers'

const sequelize = getSequelize()
const models = ModelRepository.getInstance(sequelize)

export const getProjectById = async (id: number): Promise<Project | undefined> => {
  return await models.LocationProject.findByPk(id) ?? undefined
}

/**
 * @deprecated Do not use
 */
export const getViewableProjects = async (userId: number | undefined): Promise<LocationProjectForUser[]> => {
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

  const memberProjectIds = await getProjectIdsByUser(userId)

  const projects = await models.LocationProject
    .findAll({
      where: {
        [Op.or]: [
          { id: memberProjectIds },
          { id: { [Op.in]: sequelize.literal('(SELECT location_project_id FROM project_version WHERE is_published = true)') } }
        ]
      },
      attributes: ATTRIBUTES_LOCATION_PROJECT.light,
      order: ['name'],
      raw: true
    })

  return projects.map(p => ({
      ...p,
      isMyProject: memberProjectIds.includes(p.id),
      isShowcaseProject: showcaseSlugs.includes(p.slug)
    }))
}

export const getMyProjectsWithInfo = async (userId: number, offset: number = 0, limit: number = 20): Promise<MyProjectsResponse> => {
  const memberProjectIds = await getProjectIdsByUser(userId)

  const myProjects = await models.LocationProject
    .findAll({
      where: { id: memberProjectIds },
      attributes: ATTRIBUTES_LOCATION_PROJECT.light,
      order: ['name'],
      offset,
      limit,
      raw: true
    })

  const myProjectIds = myProjects.map(p => p.id)
  const publishedInfo = await models.ProjectVersion.findAll({ where: { locationProjectId: myProjectIds }, raw: true })
  const profileInfo = await models.LocationProjectProfile.findAll({ where: { locationProjectId: myProjectIds }, raw: true })
  const countryInfo = await models.LocationProjectCountry.findAll({ where: { locationProjectId: myProjectIds }, raw: true })

  return {
    offset,
    limit,
    total: myProjects.length,
    data: myProjects.map(p => ({
      ...p,
      summary: profileInfo.find(pi => pi.locationProjectId === p.id)?.summary ?? '',
      image: getImageUrl(profileInfo.find(pi => pi.locationProjectId === p.id)?.image) ?? '',
      objectives: profileInfo.find(pi => pi.locationProjectId === p.id)?.objectives ?? [],
      countries: countryInfo.find(ci => ci.locationProjectId === p.id)?.countryCodes ?? [],
      isPublished: publishedInfo.find(pi => pi.locationProjectId === p.id)?.isPublished ?? false
    }))
  }
}

const getProjectIdsByUser = async (userId: number | undefined): Promise<number[]> => {
  if (userId === undefined) {
    return await Promise.resolve([])
  }
  const projects = await models.LocationProjectUserRole.findAll({ where: { userId }, attributes: ['locationProjectId'], raw: true })
  return projects.map(p => p.locationProjectId)
}

export const updateProjectProfile = async (projectId: number, projectProfile: Partial<LocationProjectProfile>): Promise<void> => {
  const sequelize = getSequelize()
  const { LocationProjectProfile } = ModelRepository.getInstance(sequelize)

  await LocationProjectProfile.update(projectProfile, { where: { locationProjectId: projectId } })
}
