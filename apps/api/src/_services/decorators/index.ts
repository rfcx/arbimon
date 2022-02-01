import { FAKE_PUERTO_RICO_PROJECT } from '../../projects/controller-projects-all'
import { Middleware } from '../api-helpers/types'
import { hasAccessToProject } from '../security/project-access'

interface ProjectRouteParams {
  projectId: string
}

export const IS_PROJECT_MEMBER = 'isProjectMember'

export const verifyProjectUserPermission: Middleware<ProjectRouteParams> = async (req, res): Promise<void> => {
  const token = req.headers.authorization
  const bioProjectId = Number(req.params.projectId)

  // TODO: Update it to be real project list query from db
  const coreProjectId = [FAKE_PUERTO_RICO_PROJECT].find(p => p.id === bioProjectId)?.idCore

  if (token === undefined || bioProjectId === undefined || coreProjectId === undefined) return

  const hasAccess = await hasAccessToProject(coreProjectId, token)
  if (hasAccess) { req.requestContext.set(IS_PROJECT_MEMBER, hasAccess) }
}
