import { QueryTypes } from 'sequelize'

import { type LocationProjectUserRole } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'

export const get = async (locationProjectId: number): Promise<Array<Omit<LocationProjectUserRole, 'createdAt' | 'updatedAt' | 'ranking'> & { email: string }>> => {
  const sequelize = getSequelize()

  const sql = `
    select
      location_project_user_role.location_project_id as "locationProjectId",
      location_project_user_role.user_id as "userId",
      user_profile.email as "email",
      location_project_user_role.role_id as "roleId",
      location_project_user_role.ranking as "ranking"
    from location_project_user_role
    inner join user_profile on location_project_user_role.user_id = user_profile.id
    where location_project_user_role.location_project_id = $1`

  const users = await sequelize.query<Omit<LocationProjectUserRole, 'createdAt' | 'updatedAt' | 'ranking'> & { email: string }>(sql, { bind: [locationProjectId], type: QueryTypes.SELECT })

  return users.map(u => {
    return {
      locationProjectId: u.locationProjectId,
      userId: u.userId,
      email: u.email,
      roleId: u.roleId
    }
  })
}
