import { LocationProjectModel } from '@rfcx-bio/common/dao/models/location-project-model'

import { Middleware } from '../api-helpers/types'
import { getSequelize } from '../db'
import { isProjectMember } from '../security/project-access'

interface ProjectRouteParams {
  projectId: string
}

export const IS_PROJECT_MEMBER = 'isProjectMember'

export const verifyProjectUserPermission: Middleware<ProjectRouteParams> = async (req, res): Promise<void> => {
  const token = req.headers.authorization
  const bioProjectId = Number(req.params.projectId)

  if (token === undefined || bioProjectId === undefined) return

  const coreProjectId = await LocationProjectModel(getSequelize())
    .findByPk(bioProjectId, { attributes: ['idCore'] })
    .then(proj => proj?.idCore)

  if (coreProjectId === undefined) return

  const isMember = await isProjectMember(req.log, coreProjectId, token)
  if (isMember) { req.requestContext.set(IS_PROJECT_MEMBER, isMember) }
}
