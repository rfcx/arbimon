import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { LocationProjectModel } from '@rfcx-bio/node-common/dao/models/location-project-model'
import { LocationProjectUserRoleModel } from '@rfcx-bio/node-common/dao/models/location-project-user-role-model'

import { rawUsersWithRolesToProjects } from '../_data/users'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize

  // Lookups
  const projectSlugToId: Record<string, number> = await LocationProjectModel(sequelize)
    .findAll()
    .then(allProjects => Object.fromEntries(allProjects.map(s => [s.slug, s.id])))

  rawUsersWithRolesToProjects.forEach(({ slug, users }) => {
    // Try to find project ID
    const locationProjectId = projectSlugToId[slug]
    if (!locationProjectId) return

    users.flatMap(async ({ userId, roleId }) => {
      return await LocationProjectUserRoleModel(sequelize).create({
        locationProjectId,
        userId,
        roleId,
        ranking: -1
      })
    })
  })
}
