import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type OrganizationTypes, type UserProfile } from '@rfcx-bio/common/dao/types'

import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'

const sequelize = getSequelize()
const { UserProfile: UserProfileModel } = ModelRepository.getInstance(sequelize)

export const getIdByEmail = async (email: string): Promise<number | undefined> => {
  const user = await UserProfileModel.findOne({
    where: { email },
    attributes: ['id']
  })
  return user?.id
}

export const get = async (id: number): Promise<Omit<UserProfile, 'id' | 'idAuth0'> | undefined> => {
  const profile = await UserProfileModel.findOne({
    where: { id },
    attributes: {
      exclude: ['id', 'idAuth0', 'createdAt', 'updatedAt']
    }
  })
  if (profile === null) return undefined
  const { image, ...rest } = profile.toJSON()
  return { ...rest, image: image === null ? undefined : image } // TODO: image should not be nullable
}

export const create = async (data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
  const userProfile = await UserProfileModel.create(data)
  return userProfile.id
}

export const update = async (email: string, data: Omit<UserProfile, 'id' | 'idAuth0' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  await UserProfileModel.upsert({ ...data, email })
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
