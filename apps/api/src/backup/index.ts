import { backupsRoute } from '@rfcx-bio/common/api-bio/backup/backups'

import { requireSuperUser } from '@/_hooks/require-super'
import { createBackupRequestHandler, getBackupRequestsHandler } from '@/backup/backup-handler'
import { validationHandler } from '@/backup/validation/handler'
import { type RouteRegistration, GET, POST } from '~/api-helpers/types'

// Project backups are restricted to org-level super users
// (SUPER_USER_EMAILS allow-list, e.g. arbimon-admin@rfcx.org). The
// validationHandler still enforces entity shape + view-only guards.
export const routesBackup: RouteRegistration[] = [
  {
    method: GET,
    url: backupsRoute,
    preHandler: [requireSuperUser, validationHandler],
    handler: getBackupRequestsHandler
  },
  {
    method: POST,
    url: backupsRoute,
    preHandler: [requireSuperUser, validationHandler],
    handler: createBackupRequestHandler
  }
]
