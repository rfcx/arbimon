import { Op } from 'sequelize'

import { type SearchOrganizationsResponse } from '@rfcx-bio/common/api-bio/organizations/search-organizations'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type Organization } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '~/db'

export const searchOrganizations = async (search: string, limit: number, offset: number): Promise<SearchOrganizationsResponse> => {
  const sequelize = getSequelize()
  const { Organization } = ModelRepository.getInstance(sequelize)

  const orgs = await Organization.findAll({
    where: {
      name: {
        [Op.iLike]: `%${search}%`
      }
    },
    raw: true,
    limit,
    offset
  })

  return orgs.map(o => {
    return {
      id: o.id,
      name: o.name,
      type: o.type,
      url: o.url,
      image: o.image
    }
  })
}

export const getRecommendedOrganizations = async (userIds: number[]): Promise<SearchOrganizationsResponse> => {
  const sequelize = getSequelize()
  const { Organization, UserProfile } = ModelRepository.getInstance(sequelize)

  const organizationIdAffiliated = await UserProfile.findAll({
    attributes: ['organizationIdAffiliated'],
    where: { id: { [Op.in]: userIds }, organizationIdAffiliated: { [Op.ne]: null } },
    raw: true
  })

  const recommendedOrganizations = organizationIdAffiliated.map(o => o.organizationIdAffiliated) as number[]

  const orgs = await Organization.findAll({
    where: { id: { [Op.in]: recommendedOrganizations } },
    raw: true
  }) as Organization[]

  return orgs.map(o => {
    return {
      id: o.id,
      name: o.name,
      type: o.type,
      url: o.url,
      image: o.image
    }
  })
}
