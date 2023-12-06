import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type OrganizationTypes, type UserProfile } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'

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

export const getAllOrganizations = async (): Promise<Array<OrganizationTypes['light']>> => {
  const sequelize = getSequelize()
  const { Organization } = ModelRepository.getInstance(sequelize)

  const organizations = await Organization.findAll() as Array<OrganizationTypes['light']>

  if (organizations == null) {
    throw BioNotFoundError()
  }

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
