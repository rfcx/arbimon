import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'
import { type Organization } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '~/db'

export const create = async (organization: Omit<Organization, 'id'>): Promise<Organization> => {
  const sequelize = getSequelize()

  const { Organization } = ModelRepository.getInstance(sequelize)
  const returning = await Organization.create(organization, { returning: true })

  return {
    id: returning.get('id'),
    name: returning.get('name'),
    type: returning.get('type'),
    url: returning.get('url'),
    image: returning.get('image')
  }
}
