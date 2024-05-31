import { QueryTypes } from 'sequelize'

import { type ProjectRole, getIdByRole, getRoleById } from '@rfcx-bio/common/roles'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type LocationProjectUserRole, type UserProfile } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '~/db'
import { fileUrl } from '~/format-helpers/file-url'
import { getProjectById } from './projects-dao'

const sequelize = getSequelize()
const { LocationProjectUserRole: LocationProjectUserRoleModel } = ModelRepository.getInstance(sequelize)

export const get = async (locationProjectId: number): Promise<Array<Omit<LocationProjectUserRole, 'createdAt' | 'updatedAt' | 'ranking'> & Pick<UserProfile, 'email' | 'firstName' | 'lastName' | 'image'>>> => {
  const sql = `
    select
      location_project_user_role.location_project_id as "locationProjectId",
      location_project_user_role.user_id as "userId",
      location_project_user_role.role_id as "roleId",
      location_project_user_role.ranking as "ranking",
      user_profile.first_name as "firstName",
      user_profile.last_name as "lastName",
      user_profile.image,
      user_profile.email
    from location_project_user_role
    inner join user_profile on location_project_user_role.user_id = user_profile.id
    where location_project_user_role.location_project_id = $1`

  const users = await sequelize.query<Omit<LocationProjectUserRole, 'createdAt' | 'updatedAt' | 'ranking'> & Pick<UserProfile, 'email' | 'firstName' | 'lastName' | 'image'>>(sql, { bind: [locationProjectId], type: QueryTypes.SELECT })

  return users.map(u => {
    return {
      locationProjectId: u.locationProjectId,
      userId: u.userId,
      firstName: u.firstName,
      lastName: u.lastName,
      image: fileUrl(u.image) ?? '',
      email: u.email,
      roleId: u.roleId
    }
  })
}

export const getRoleIdByProjectAndUser = async (locationProjectId: number, userId: number): Promise<number | undefined> => {
  const role = await LocationProjectUserRoleModel.findOne({ where: { locationProjectId, userId } })
  return role?.roleId
}

export const create = async (data: { locationProjectId: number, userId: number, role: Exclude<ProjectRole, 'none'>, ranking: number }): Promise<void> => {
  const { role, ...otherFields } = data
  const roleId = getIdByRole(role)
  await LocationProjectUserRoleModel.create({ ...otherFields, roleId })
}

export const destroy = async (projectId: number, userId: number): Promise<void> => {
  await LocationProjectUserRoleModel.destroy({
    where: { locationProjectId: projectId, userId }
  })
}

export const update = async (data: { locationProjectId: number, userId: number, role: Exclude<ProjectRole, 'none'> }): Promise<void> => {
  const { role, ...where } = data
  const roleId = getIdByRole(role)
  await LocationProjectUserRoleModel.update({ roleId }, { where })
}

export const getUserRoleForProject = async (userId: number | undefined, projectId: number): Promise<ProjectRole> => {
  const projectIsPublished = await getProjectById(projectId).then(p => p?.status === 'published' ?? false)

  // When there is no user (no token) and project is not published, no role
  // When there is no user and project is published, set as external
  if (userId === undefined) {
    return projectIsPublished ? 'external' : 'none'
  }

  const roleId = await getRoleIdByProjectAndUser(projectId, userId)

  // When the user is not a project member and project is not published, no role
  // When the user is not a project member and project is published, set as external
  if (roleId === undefined) {
    return projectIsPublished ? 'external' : 'none'
  }

  // Else user is project member, set the role from the db
  return getRoleById(roleId)
}
