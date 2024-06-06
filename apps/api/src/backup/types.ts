import { type Project } from '@rfcx-bio/node-common/dao/types'

import { getProjectById } from '@/projects/dao/projects-dao'

export const ALLOWED_BACKUP_TYPES = ['project']

export const BackupEntityGetters: Record<string, (id: number) => Promise<Project | undefined>> = {
    project: getProjectById
}
