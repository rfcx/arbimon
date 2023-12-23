import { type ProjectPermission, hasPermission } from '@rfcx-bio/common/roles'

import { type Middleware } from '~/api-helpers/types'
import { BioForbiddenError } from '~/errors'

export const requireProjectPermission: (permission: ProjectPermission) => Middleware<void> =
  (permission) => {
    return async (req): Promise<void> => {
      if (!hasPermission(req.projectRole, permission)) {
        throw BioForbiddenError()
      }
    }
}
