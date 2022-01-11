import { Project, ProjectsResponse } from '@rfcx-bio/common/api-bio/common/projects'
import { SitesParams, SitesResponse } from '@rfcx-bio/common/api-bio/common/sites'
import { rawSites, simulateDelay } from '@rfcx-bio/common/mock-data'

import { Controller } from '~/api-helper/types'
import { env } from '~/env'

const FAKE_PUERTO_RICO_PROJECT: Project = {
  id: env.PUERTO_RICO_PROJECT_SLUG,
  name: 'Puerto Rico Island-Wide',
  isPublic: true,
  externalId: 123456,
  geoBounds: [
    { lon: -65.24505, lat: 18.51375 },
    { lon: -67.94469784, lat: 17.93168 }
  ]
}

export const projectsController: Controller<unknown, ProjectsResponse> = async () => {
  return [FAKE_PUERTO_RICO_PROJECT]
}

export const sitesController: Controller<SitesParams, SitesResponse> = async () => {
  return await simulateDelay(rawSites.sort((a, b) => a.name.localeCompare(b.name)))
}
