import { type CreateOrganizationRequestBody, type CreateOrganizationResponseBody } from '@rfcx-bio/common/api-bio/organizations/create-organization'
import { ORGANIZATION_TYPE } from '@rfcx-bio/node-common/dao/types'

import { isValidToken } from '~/api-helpers/is-valid-token'
import { type Handler } from '~/api-helpers/types'
import { BioPublicError, BioUnauthorizedError } from '~/errors'
import { createOrganization } from './create-organization-bll'

export const createOrganizationHandler: Handler<CreateOrganizationResponseBody, unknown, unknown, CreateOrganizationRequestBody> = async (req) => {
  const token = req.headers.authorization

  // no token no data
  if (token === undefined || !isValidToken(token)) {
    throw BioUnauthorizedError()
  }

  // inputs and validations
  if (!ORGANIZATION_TYPE.includes(req.body.type)) {
    throw new BioPublicError('error: invalid `type` of organization', 400)
  }

  if (req.body.name == null || req.body.name === '') {
    throw new BioPublicError('error: invalid `name` of organization', 400)
  }

  if (req.body.url == null || req.body.url === '') {
    throw new BioPublicError('error: invalid `url` of organization', 400)
  }

  const organization = await createOrganization(req.body)
  return organization
}
