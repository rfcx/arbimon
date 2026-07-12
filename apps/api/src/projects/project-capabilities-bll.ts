import { hasPermission } from '@rfcx-bio/common/roles'
import { type ProjectRole } from '@rfcx-bio/common/roles'

import { getProjectTieringUsageLegacy } from '~/api-legacy-arbimon'
import { env } from '~/env'
import { getProjectById } from './dao/projects-dao'

/**
 * Self-serve project delete / backup thresholds (2026-07-12, operator D3).
 *
 * Super users (SUPER_USER_EMAILS) can always delete/backup any project. In
 * addition, regular project owners/admins can self-serve these operations on
 * SMALL projects, where "small" is measured in recordings:
 *   - delete: project has <= PROJECT_DELETE_MAX_RECORDINGS (default 60)
 *   - backup: project has <= PROJECT_BACKUP_MAX_RECORDINGS (default 100)
 *
 * The thresholds are env-var-backed so the operator can adjust them without a
 * code change (rfcx-local: configmap biodiversity-api-prod-overrides).
 *
 * The recordings count comes from legacy's tiering-usage endpoint
 * (`recordingMinutesCount` is historically misnamed — it is a COUNT of
 * recordings, which is exactly what we want here). If legacy is unreachable
 * the count is unknown and we FAIL CLOSED for non-super users (destructive /
 * expensive operations should not open up on a dependency outage).
 */

export const DEFAULT_PROJECT_DELETE_MAX_RECORDINGS = 60
export const DEFAULT_PROJECT_BACKUP_MAX_RECORDINGS = 100

const parseThreshold = (raw: string | undefined, fallback: number): number => {
  if (raw === undefined || raw === '') return fallback
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 ? value : fallback
}

export const getProjectDeleteMaxRecordings = (): number =>
  parseThreshold(env.PROJECT_DELETE_MAX_RECORDINGS, DEFAULT_PROJECT_DELETE_MAX_RECORDINGS)

export const getProjectBackupMaxRecordings = (): number =>
  parseThreshold(env.PROJECT_BACKUP_MAX_RECORDINGS, DEFAULT_PROJECT_BACKUP_MAX_RECORDINGS)

export const getProjectRecordingCount = async (token: string, projectId: number): Promise<number | undefined> => {
  const project = await getProjectById(projectId)
  if (project === undefined) return undefined
  try {
    const usage = await getProjectTieringUsageLegacy(token, project.slug)
    const count = Number(usage?.recordingMinutesCount)
    return Number.isFinite(count) ? count : undefined
  } catch (e) {
    // Unknown count => fail closed for non-super callers.
    return undefined
  }
}

export interface ProjectCapabilities {
  canDelete: boolean
  canBackup: boolean
  recordingCount: number | null
  deleteMaxRecordings: number
  backupMaxRecordings: number
}

export const getProjectCapabilities = async (
  token: string,
  projectId: number,
  role: ProjectRole,
  isSuper: boolean
): Promise<ProjectCapabilities> => {
  const deleteMax = getProjectDeleteMaxRecordings()
  const backupMax = getProjectBackupMaxRecordings()

  if (isSuper) {
    return { canDelete: true, canBackup: true, recordingCount: null, deleteMaxRecordings: deleteMax, backupMaxRecordings: backupMax }
  }

  const canDeleteByRole = hasPermission(role, 'delete-project')
  const canBackupByRole = hasPermission(role, 'backup-project')
  if (!canDeleteByRole && !canBackupByRole) {
    return { canDelete: false, canBackup: false, recordingCount: null, deleteMaxRecordings: deleteMax, backupMaxRecordings: backupMax }
  }

  const count = await getProjectRecordingCount(token, projectId)
  return {
    canDelete: canDeleteByRole && count !== undefined && count <= deleteMax,
    canBackup: canBackupByRole && count !== undefined && count <= backupMax,
    recordingCount: count ?? null,
    deleteMaxRecordings: deleteMax,
    backupMaxRecordings: backupMax
  }
}
