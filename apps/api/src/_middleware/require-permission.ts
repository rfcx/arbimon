import { type Middleware } from '~/api-helpers/types'
import { BioForbiddenError } from '~/errors'
import { type ProjectPermission, hasPermission } from '~/roles'

export const requireProjectPermission: (permission: ProjectPermission) => Middleware<void> =
  (permission) => {
    return async (req): Promise<void> => {
      if (!hasPermission(req.projectRole, permission)) {
        throw BioForbiddenError()
      }
    }
}
