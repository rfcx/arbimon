import { Op } from 'sequelize'

import { type LocationProjectForUser, type MyProjectsResponse } from '@rfcx-bio/common/api-bio/project/projects'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type Project, ATTRIBUTES_LOCATION_PROJECT } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'
import { fileUrl } from '~/format-helpers/file-url'

const sequelize = getSequelize()
const models = ModelRepository.getInstance(sequelize)

export const getProjectById = async (id: number): Promise<Project | undefined> => {
  return await models.LocationProject.findByPk(id) ?? undefined
}

export const deleteProject = async (id: number): Promise<boolean> => {
  const count = await models.LocationProject.destroy({ where: { id } })
  return count > 0
}

/**
 * @deprecated Do not use
 */
export const getViewableProjects = async (userId: number | undefined): Promise<LocationProjectForUser[]> => {
  const memberProjectIds = await getProjectIdsByUser(userId)

  const projects = await models.LocationProject
    .findAll({
      where: {
        [Op.or]: [
          { id: memberProjectIds },
          { status: ['listed', 'published'] }
        ]
      },
      attributes: ATTRIBUTES_LOCATION_PROJECT.light,
      order: ['name'],
      raw: true
    })

  return projects.map(p => ({
      ...p,
      isMyProject: memberProjectIds.includes(p.id)
    }))
}

export const getMyProjectsWithInfo = async (userId: number, offset: number = 0, limit: number = 20): Promise<MyProjectsResponse> => {
  const memberProjectIds = await getProjectIdsByUser(userId)

  const myProjects = await models.LocationProject
    .findAll({
      where: { id: memberProjectIds },
      attributes: ATTRIBUTES_LOCATION_PROJECT.light,
      order: ['name', 'status'],
      offset,
      limit,
      raw: true
    })

  const myProjectIds = myProjects.map(p => p.id)
  const profileInfo = await models.LocationProjectProfile.findAll({ where: { locationProjectId: myProjectIds }, raw: true })
  const countryInfo = await models.LocationProjectCountry.findAll({ where: { locationProjectId: myProjectIds }, raw: true })

  return {
    offset,
    limit,
    total: myProjects.length,
    data: myProjects.map(p => ({
      ...p,
      summary: profileInfo.find(pi => pi.locationProjectId === p.id)?.summary ?? '',
      image: fileUrl(profileInfo.find(pi => pi.locationProjectId === p.id)?.image) ?? '',
      objectives: profileInfo.find(pi => pi.locationProjectId === p.id)?.objectives ?? [],
      countries: countryInfo.find(ci => ci.locationProjectId === p.id)?.countryCodes ?? [],
      isPublished: p.status === 'published'
    }))
  }
}

export const getProjectCoreId = async (locationProjectId: number): Promise<string | undefined> => {
  const project = await ModelRepository.getInstance(getSequelize())
  .LocationProject
  .findOne({
    where: { id: locationProjectId },
    attributes: ['idCore'],
    raw: true
  })
  return project?.idCore ?? undefined
}

const getProjectIdsByUser = async (userId: number | undefined): Promise<number[]> => {
  if (userId === undefined) {
    return await Promise.resolve([])
  }
  const projects = await models.LocationProjectUserRole.findAll({ where: { userId }, attributes: ['locationProjectId'], raw: true })
  return projects.map(p => p.locationProjectId)
}
