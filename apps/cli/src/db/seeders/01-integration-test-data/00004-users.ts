import { type QueryInterface } from 'sequelize'
import { type MigrationFn } from 'umzug'

import { UserProfileModel } from '@rfcx-bio/node-common/dao/models/user-profile-model'

import { rawUsers } from '../_data/users'

export const up: MigrationFn<QueryInterface> = async (params): Promise<void> => {
  const sequelize = params.context.sequelize
  await UserProfileModel(sequelize).bulkCreate(rawUsers)
}
