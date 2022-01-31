import { FastifyReply, FastifyRequest } from 'fastify'

import { FAKE_PUERTO_RICO_PROJECT } from '../../projects/controller-projects-all'
import { hasAccessToProject } from '../api-core/api-core'

export async function verifyProjectUserPermission (req: FastifyRequest, res: FastifyReply): Promise<void> {
  const token = req.headers.authorization
  // @ts-expect-error
  const bioProjectId = req.params.projectId

  // TODO: Update it to be real project list query from db
  const coreProjectId = [FAKE_PUERTO_RICO_PROJECT].find(p => p.id === bioProjectId)?.idCore

  if (token === undefined || bioProjectId === undefined || coreProjectId === undefined) return

  const hasAccess = await hasAccessToProject(coreProjectId, token)
  if (hasAccess) { req.requestContext.set('projectPermission', hasAccess) }
}
