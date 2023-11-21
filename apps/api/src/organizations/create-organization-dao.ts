import { type CreateOrganizationRequestBody, type CreateOrganizationResponseBody } from '@rfcx-bio/common/api-bio/organizations/create-organization'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'

import { getSequelize } from '~/db'

export const createNewOrganization = async (body: CreateOrganizationRequestBody, image: string | null): Promise<CreateOrganizationResponseBody> => {
  const sequelize = getSequelize()

  const { Organization } = ModelRepository.getInstance(sequelize)

  const returning = await Organization.create({
    name: body.name,
    type: body.type,
    url: body.url,
    image
  }, { returning: true })

  return {
    id: returning.get('id'),
    name: returning.get('name'),
    type: returning.get('type'),
    url: returning.get('url'),
    image: returning.get('image')
  }
}
