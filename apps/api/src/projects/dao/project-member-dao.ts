import { QueryTypes } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type LocationProjectUserRole, type UserProfile } from '@rfcx-bio/common/dao/types'
import { type ProjectRole, getIdByRole, getRoleById } from '@rfcx-bio/common/roles'

import { getSequelize } from '~/db'
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
      image: u.image,
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
  // check if project published / public
  const project = await getProjectById(projectId)
  const isPubliclyAccessible = project?.status === 'published'
  if (userId === undefined) {
    return isPubliclyAccessible ? 'guest' : 'none'
  }
  // check if user is project member
  const roleId = await getRoleIdByProjectAndUser(projectId, userId)
  if (roleId === undefined) {
    return isPubliclyAccessible ? 'guest' : 'none'
  }

  return getRoleById(roleId)
}
