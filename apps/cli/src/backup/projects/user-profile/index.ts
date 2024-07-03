import { type Sequelize } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import type { UserProfile } from '@rfcx-bio/node-common/dao/types/user-profile'


export const getUserFromEmail = async (
  sequelize: Sequelize,
  email: string,
): Promise<UserProfile | null> => {
  const { UserProfile } = ModelRepository.getInstance(sequelize)
  const user = await UserProfile.findOne({ where: { email } })
  return user
}
