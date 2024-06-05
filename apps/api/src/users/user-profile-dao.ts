import { type WhereValue, Op } from 'sequelize'

import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type OrganizationTypes, type UserProfile, type UserTypes, ATTRIBUTES_USER } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '~/db'
import { BioNotFoundError } from '~/errors'

const sequelize = getSequelize()
const { UserProfile: UserProfileModel } = ModelRepository.getInstance(sequelize)

export const query = async (filters: { emailLike?: string }, options?: { limit?: number, offset?: number }): Promise<Array<UserTypes['light']>> => {
  const attributes = ATTRIBUTES_USER.light
  const where: { email?: WhereValue } = {}
  if (filters.emailLike) {
    where.email = { [Op.iLike]: `${filters.emailLike}%` }
  }
  const limit = options?.limit ?? 10
  const offset = options?.offset ?? 0

  return await UserProfileModel.findAll({ where, attributes, limit, offset })
}

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
  // Check for existing user with this email, do a case-insensitive search
  const user = await UserProfileModel.findOne({
    where: sequelize.where(
        sequelize.fn('lower', sequelize.col('email')),
        sequelize.fn('lower', email)
    )
  })

  if (user) {
    const { email, ...rest } = data
    user.set(rest)
    await user.save()
  } else {
    await UserProfileModel.create({ ...data, email })
  }
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
