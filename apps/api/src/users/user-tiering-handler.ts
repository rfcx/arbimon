import { type PortfolioSummaryResponse, type SubmitTierChangeRequestBody, type SubmitTierChangeResponse } from '@rfcx-bio/common/api-bio/users/tiering'

import { type Handler } from '~/api-helpers/types'
import { getPortfolioSummary, submitTierChange } from './user-tiering-bll'

export const userPortfolioSummaryHandler: Handler<PortfolioSummaryResponse> = async (req) => {
  return await getPortfolioSummary(req.userId as number)
}

export const submitUserTierChangeHandler: Handler<SubmitTierChangeResponse, unknown, unknown, SubmitTierChangeRequestBody> = async (req) => {
  return await submitTierChange(req.userId as number, req.body)
}
