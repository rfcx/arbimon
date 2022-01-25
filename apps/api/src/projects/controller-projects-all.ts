import { Project, ProjectsResponse } from '@rfcx-bio/common/api-bio/common/projects'

import { Controller } from '../_services/api-helper/types'
import { env } from '../_services/env'

const FAKE_PUERTO_RICO_PROJECT: Project = {
  id: 1,
  idCore: 'zy5jbxx4cs9f',
  idArbimon: 0,
  slug: env.PUERTO_RICO_PROJECT_SLUG,
  name: 'Puerto Rico Island-Wide',
  latitudeNorth: 18.51375,
  latitudeSouth: 17.93168,
  longitudeEast: -65.24505,
  longitudeWest: -67.94469784
}

export const controllerProjectsAll: Controller<ProjectsResponse> = async (req) => {
  // TODO: Remove auth logic here to be better strategy
  const isAuthorized = req.headers.authorization?.replace('Bearer ', '')
  if (!isAuthorized) {
    return [FAKE_PUERTO_RICO_PROJECT]
  }

  return [FAKE_PUERTO_RICO_PROJECT]
}
