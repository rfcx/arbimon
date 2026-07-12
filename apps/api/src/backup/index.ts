import { backupsRoute } from '@rfcx-bio/common/api-bio/backup/backups'

import { createBackupRequestHandler, getBackupRequestsHandler } from '@/backup/backup-handler'
import { validationHandler } from '@/backup/validation/handler'
import { type RouteRegistration, GET, POST } from '~/api-helpers/types'

// Project backups (2026-07-12, operator D3): super users
// (SUPER_USER_EMAILS) can always request backups; regular project
// admins/owners can self-serve backups for SMALL projects
// (<= PROJECT_BACKUP_MAX_RECORDINGS, default 100 recordings). Authz +
// entity shape + view-only guards enforced inside validationHandler.
export const routesBackup: RouteRegistration[] = [
  {
    method: GET,
    url: backupsRoute,
    preHandler: [validationHandler],
    handler: getBackupRequestsHandler
  },
  {
    method: POST,
    url: backupsRoute,
    preHandler: [validationHandler],
    handler: createBackupRequestHandler
  }
]
