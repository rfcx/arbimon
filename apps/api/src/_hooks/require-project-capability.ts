import { isSuperUser } from '@/_services/auth0/is-super-user'
import { getProjectCapabilities } from '@/projects/project-capabilities-bll'
import { type Middleware } from '~/api-helpers/types'
import { BioForbiddenError, BioUnauthorizedError } from '~/errors'

/**
 * Self-serve project delete / backup gating (2026-07-12, operator D3):
 * super users always pass; regular members pass when their role has the
 * corresponding permission AND the project is small enough
 * (PROJECT_DELETE_MAX_RECORDINGS / PROJECT_BACKUP_MAX_RECORDINGS).
 */

export const requireProjectDeleteAllowed: Middleware<{ projectId?: string }> = async (req): Promise<void> => {
  if (req.userId === undefined) throw BioUnauthorizedError()
  if (isSuperUser(req)) return

  const projectId = Number(req.params?.projectId)
  if (Number.isNaN(projectId)) throw BioForbiddenError()

  const capabilities = await getProjectCapabilities(req.headers.authorization ?? '', projectId, req.projectRole, false)
  if (!capabilities.canDelete) throw BioForbiddenError()
}
