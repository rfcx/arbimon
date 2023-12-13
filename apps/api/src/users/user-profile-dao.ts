import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type OrganizationTypes, type UserProfile } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'

export const get = async (userIdAuth0: string): Promise<Omit<UserProfile, 'id' | 'userIdAuth0'> | undefined> => {
  const sequelize = getSequelize()
  const models = ModelRepository.getInstance(sequelize)

  return (await models.UserProfile.findOne({
    where: { userIdAuth0 },
    attributes: {
      exclude: ['id', 'userIdAuth0', 'createdAt', 'updatedAt']
    }
  }))?.toJSON() ?? undefined
}

export const update = async (userIdAuth0: string, data: Omit<UserProfile, 'id' | 'userIdAuth0' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const sequelize = getSequelize()
  const { UserProfile } = ModelRepository.getInstance(sequelize)

  // TODO: `id` needs to be auto-incrementing PK
  await UserProfile.upsert({ id: 1, ...data, userIdAuth0 })
}

// TODO: Move to organizations DAO
export const getAllOrganizations = async (): Promise<Array<OrganizationTypes['light']>> => {
  const sequelize = getSequelize()
  const { Organization } = ModelRepository.getInstance(sequelize)

  const organizations = await Organization.findAll() as Array<OrganizationTypes['light']>

  if (organizations == null) {
    throw BioNotFoundError()
  }

  // TODO: Pointless map?
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
