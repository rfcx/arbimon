import axios from 'axios'
import { maxBy } from 'lodash-es'

import { type OrganizationTypes } from '@rfcx-bio/node-common/dao/types'


import { getOrganizationLogoLink } from '~/logo'
import { create } from './create-organization-dao'

export const createOrganization = async (organization: Omit<OrganizationTypes['light'], 'id'>): Promise<OrganizationTypes['light']> => {
  const image = await getOrganizationLogoLink(organization.url)
  return await create({ ...organization, image: image ?? undefined })
}
