import { Project, ProjectsResponse } from '@rfcx-bio/common/api-bio/common/projects'

import { Handler } from '../_services/api-helpers/types'
import { env } from '../_services/env'

export const FAKE_PUERTO_RICO_PROJECT: Project = {
  id: env.PUERTO_RICO_PROJECT_SLUG,
  idCore: env.PUERTO_RICO_PROJECT_CORE_ID,
  name: 'Puerto Rico Island-Wide',
  isPublic: true,
  externalId: 123456,
  geoBounds: [
    { lon: -65.24505, lat: 18.51375 },
    { lon: -67.94469784, lat: 17.93168 }
  ]
}

export const projectsAllHandler: Handler<ProjectsResponse> = async (req) => {
  // TODO: Remove auth logic here to be better strategy
  const isAuthorized = req.headers.authorization?.replace('Bearer ', '')
  if (!isAuthorized) {
    return [FAKE_PUERTO_RICO_PROJECT].filter(p => p.isPublic)
  }

  return [FAKE_PUERTO_RICO_PROJECT]
}
