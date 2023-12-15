import { QueryTypes } from 'sequelize'

import { type DashboardStakeholdersUser } from '@rfcx-bio/common/api-bio/dashboard/dashboard-stakeholders'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type OrganizationTypes } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'

export const getProjectUsers = async (projectId: number): Promise<DashboardStakeholdersUser[]> => {
  const sequelize = getSequelize()

  // INFO: raking higher than -1 for select everyone who's displayed on the stakeholders section.
  const sql = `
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
    where location_project_user_role.location_project_id = $1 and location_project_user_role.ranking < -1`

  const projectUsers = await sequelize.query<DashboardStakeholdersUser>(sql, { bind: [projectId], type: QueryTypes.SELECT })

  if (projectUsers == null) {
    throw BioNotFoundError()
  }

  return projectUsers
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

export const updateProjectStakeholdersOrganization = async (projectId: number, organizationIds: number[]): Promise<void> => {
  const sequelize = getSequelize()
  const { LocationProjectOrganization } = ModelRepository.getInstance(sequelize)

  await sequelize.transaction(async t => {
    await LocationProjectOrganization.destroy({ where: { locationProjectId: projectId }, transaction: t })
    await LocationProjectOrganization.bulkCreate(organizationIds.map(o => ({ locationProjectId: projectId, organizationId: o })), { transaction: t })
  })
}
