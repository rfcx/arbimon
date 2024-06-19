import { backupsRoute } from '@rfcx-bio/common/api-bio/backup/backups'

import { createBackupRequestHandler, getBackupRequestsHandler } from '@/backup/backup-handler'
import { validationHandler } from '@/backup/validation/handler'
import { type RouteRegistration, GET, POST } from '~/api-helpers/types'

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
