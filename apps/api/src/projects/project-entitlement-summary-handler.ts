import { type ProjectEntitlementSummaryParams, type ProjectEntitlementSummaryResponse } from '@rfcx-bio/common/api-bio/project/project-entitlement-summary'

import { type Handler } from '~/api-helpers/types'
import { BioInvalidPathParamError } from '~/errors'
import { assertPathParamsExist } from '~/validation'
import { getProjectEntitlementSummaryBySlug } from './projects-bll'

export const projectEntitlementSummaryHandler: Handler<ProjectEntitlementSummaryResponse, ProjectEntitlementSummaryParams> = async (req) => {
  const { slug } = req.params
  assertPathParamsExist({ slug })

  if (typeof slug !== 'string' || slug.trim().length === 0) {
    throw BioInvalidPathParamError({ slug })
  }

  return await getProjectEntitlementSummaryBySlug(slug)
}
