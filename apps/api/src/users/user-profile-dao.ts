import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type UserProfile } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'

export const getUserProfile = async (userIdAuth0: string): Promise<Omit<UserProfile, 'id' | 'userIdAuth0'> | undefined> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  return await models.UserProfile.findOne({
    where: { userIdAuth0 },
    attributes: {
      exclude: ['id', 'userIdAuth0']
    }
  }) ?? undefined
}
