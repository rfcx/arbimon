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

export const patchUserProfile = async (userIdAuth0: string, data: Partial<Omit<UserProfile, 'id' | 'userIdAuth0' | 'image' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const sequelize = getSequelize()
  const { UserProfile } = ModelRepository.getInstance(sequelize)

  await UserProfile.update(data, { where: { userIdAuth0 } })
}

export const patchUserProfileImage = async (userIdAuth0: string, path: string): Promise<void> => {
  const sequelize = getSequelize()
  const { UserProfile } = ModelRepository.getInstance(sequelize)

  await UserProfile.update({ image: path }, { where: { userIdAuth0 } })
}
