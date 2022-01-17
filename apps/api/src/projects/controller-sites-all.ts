import { SitesParams, SitesResponse } from '@rfcx-bio/common/api-bio/common/sites'
import { rawSites, simulateDelay } from '@rfcx-bio/common/mock-data'

import { Controller } from '../_services/api-helper/types'

export const controllerSitesAll: Controller<SitesResponse, SitesParams> = async () => {
  return await simulateDelay(rawSites.sort((a, b) => a.name.localeCompare(b.name)))
}
