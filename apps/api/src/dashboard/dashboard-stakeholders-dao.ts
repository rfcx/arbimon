import { Op, QueryTypes } from 'sequelize'

import { type DashboardStakeholdersUser } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type LocationProjectUserRole, type OrganizationTypes } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'
import { fileUrl } from '~/format-helpers/file-url'

export const getProjectUsers = async (projectId: number, onlyListedMembers: boolean = true): Promise<DashboardStakeholdersUser[]> => {
  const sequelize = getSequelize()

  const mainQuery = `
    select
      location_project_user_role.user_id as "id",
      location_project_user_role.role_id as "roleId",
      location_project_user_role.ranking as "ranking",
      user_profile.first_name as "firstName",
      user_profile.last_name as "lastName",
      user_profile.image,
      user_profile.email
    from location_project_user_role
    inner join user_profile on location_project_user_role.user_id = user_profile.id
    where location_project_user_role.location_project_id = $1`

  const listedMembersSql = ' and location_project_user_role.ranking != -1'

  const sql = `${mainQuery}${onlyListedMembers ? listedMembersSql : ''}`

  const projectUsers = await sequelize.query<DashboardStakeholdersUser>(sql, { bind: [projectId], type: QueryTypes.SELECT })

  if (projectUsers == null) {
    throw BioNotFoundError()
  }

  return projectUsers.map(p => {
    return {
      id: p.id,
      email: p.email,
      firstName: p.firstName,
      lastName: p.lastName,
      image: fileUrl(p.image),
      roleId: p.roleId,
      ranking: p.ranking
    }
  })
}

export const getProjectStakeholders = async (projectId: number): Promise<Array<OrganizationTypes['light']>> => {
  const sequelize = getSequelize()
  const { Organization, LocationProject } = ModelRepository.getInstance(sequelize)

  const projectOrganizations = await LocationProject.findOne({
    where: {
      id: projectId
    },
    include: Organization
  })

  if (projectOrganizations == null) {
    throw BioNotFoundError()
  }

  // The cast here is to satisfy typescript.
  const organizations = projectOrganizations.get('Organization', { plain: true }) as Array<OrganizationTypes['light']>

  return organizations.map(o => {
    return {
      id: o.id,
      name: o.name,
      type: o.type,
      url: o.url,
      image: o.image
    }
  })
}

export const getProjectStakeholderUsers = async (projectId: number): Promise<DashboardStakeholdersUser[]> => {
  const sequelize = getSequelize()
  const { LocationProjectUserRole, UserProfile } = ModelRepository.getInstance(sequelize)
  const users = await LocationProjectUserRole.findAll({
    where: {
      locationProjectId: projectId,
      ranking: {
        [Op.gte]: 0
      }
    },
    order: [['ranking', 'ASC']],
    raw: true
  })
  const profile = await UserProfile.findAll({
    where: {
      id: {
        [Op.in]: users.map(u => u.userId)
      }
    },
    raw: true
  })
  return users.map(u => {
    const p = profile.find(p => p.id === u.userId)
    return {
      id: u.userId,
      email: u.ranking !== 0 ? '' : p?.email ?? '', // only return email for primary contact
      firstName: p?.firstName ?? '',
      lastName: p?.lastName ?? '',
      image: fileUrl(p?.image),
      roleId: u.roleId,
      ranking: u.ranking
    }
  })
}

export const updateProjectStakeholders = async (projectId: number, stakeholders: { organizations: number[], users: Array<Pick<LocationProjectUserRole, 'userId' | 'ranking'>> }): Promise<void> => {
  const sequelize = getSequelize()
  const { LocationProjectOrganization, LocationProjectUserRole } = ModelRepository.getInstance(sequelize)

  const updateUserSql = 'update location_project_user_role set ranking = $1 where location_project_id = $2 and user_id = $3'

  await sequelize.transaction(async t => {
    await LocationProjectOrganization.destroy({ where: { locationProjectId: projectId }, transaction: t })
    await LocationProjectOrganization.bulkCreate(stakeholders.organizations.map(o => ({ locationProjectId: projectId, organizationId: o })), { transaction: t })

    // individually run an update on each user (we cannot simple delete them and recreate them)
    for (const user of stakeholders.users) {
      await sequelize.query(updateUserSql, { bind: [user.ranking, projectId, user.userId], transaction: t })
    }

    // find other users that are not on the update list and turn their ranking to -1
    const selectedUsers = stakeholders.users.map(u => u.userId)
    const usersNotOnStakeholdersUpdateList = await LocationProjectUserRole.findAll({ where: { locationProjectId: projectId, userId: { [Op.notIn]: selectedUsers } }, transaction: t })
    for (const excludedUser of usersNotOnStakeholdersUpdateList) {
      await sequelize.query(updateUserSql, { bind: [-1, projectId, excludedUser.get('userId')], transaction: t })
    }
  })
}
