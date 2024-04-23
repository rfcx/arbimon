import { backupsRoute } from '@rfcx-bio/common/api-bio/backup/backups'

import { requireProjectPermission } from '@/_hooks/require-permission'
import { createBackupRequestHandler, getBackupRequestsHandler } from '@/backup/backup-handler'
import { type RouteRegistration, GET, POST } from '~/api-helpers/types'

export const routesBackup: RouteRegistration[] = [
    {
        method: GET,
        url: backupsRoute,
        preHandler: [requireProjectPermission('delete-project')], // project owners only
        handler: getBackupRequestsHandler
    },
    {
        method: POST,
        url: backupsRoute,
        preHandler: [requireProjectPermission('delete-project')], // project owners only
        handler: createBackupRequestHandler
    }
]
