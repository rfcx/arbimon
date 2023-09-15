import { type LandingPublicationsResponse } from '@rfcx-bio/common/api-bio/landing/landing-publications'

import { type Handler } from '~/api-helpers/types'
import { getPublications } from './landing-publications-bll'

export const landingPublicationsHandler: Handler<LandingPublicationsResponse> = async (_, res) => {
  // cache this response for 1 hour
  void res.header('Cache-control', 'public s-maxage=3600')
  return await getPublications()
}
