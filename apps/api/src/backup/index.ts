import { backupsRoute } from '@rfcx-bio/common/api-bio/backup/backups'

import { createBackupRequestHandler, getBackupRequestsHander } from '@/backup/backup-handler'
import { type RouteRegistration, GET, POST } from '~/api-helpers/types'

export const routesBackup: RouteRegistration[] = [
    {
        method: GET,
        url: backupsRoute,
        // TODO authorize endpoint
        handler: getBackupRequestsHander
    },
    {
        method: POST,
        url: backupsRoute,
        // TODO authorize endpoint
        handler: createBackupRequestHandler
    }
]
