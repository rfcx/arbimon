import { QueryTypes } from 'sequelize'

import { type AccountTier, type ProjectType } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '~/db'

export interface ProjectTypeLimit {
  recordingMinutesCount: number | null
  collaboratorCount: number | null
  guestCount: number | null
  /** Max Admin-role members (subset of collaborators). NULL = unlimited. */
  adminCount: number | null
  jobCount: number | null
  jobRecordingCount: number | null
}

export interface AccountTierProjectLimitMap {
  free: number | null
  premium: number | null
  unlimited: number | null
}

interface ProjectTypeLimitRow {
  projectType: ProjectType
  recordingMinutesCount: number | null
  collaboratorCount: number | null
  guestCount: number | null
  adminCount: number | null
  jobCount: number | null
  jobRecordingCount: number | null
}

interface AccountTierProjectLimitRow {
  projectType: ProjectType
  activeProjectCount: number | null
}

const PROJECT_TYPE_LIMIT_TABLE = 'project_type_limit'
const ACCOUNT_TIER_PROJECT_LIMIT_TABLE = 'account_tier_project_limit'

// Team-shape limits (2026-08-17, supersedes the all-NULL 2026-07-12 rollback
// defaults for the free tier): free = 5 collaborators / 1 Admin / unlimited
// guests, matching the /pricing Team row and the live project_type_limit rows
// armed by migration 260817-01 — these defaults MUST mirror those rows so a
// fresh seed / missing-table fallback behaves identically to production.
// recordingMinutesCount stays NULL on EVERY tier ("Unlimited audio uploads",
// operator decision 2026-08-17) — do not re-arm it.
// The numbers are TUNABLE WITHOUT REBUILD: this table is read per request, so
// an UPDATE on project_type_limit changes enforcement immediately; these
// constants are only the fallback when the table is missing/empty.
const DEFAULT_PROJECT_LIMITS: Record<ProjectType, ProjectTypeLimit> = {
  free: {
    recordingMinutesCount: null,
    collaboratorCount: 5,
    guestCount: null,
    adminCount: 1,
    jobCount: null,
    jobRecordingCount: null
  },
  premium: {
    recordingMinutesCount: null,
    collaboratorCount: null,
    guestCount: null,
    adminCount: null,
    jobCount: null,
    jobRecordingCount: null
  },
  // 'unlimited' is retired (folded into 'premium'); kept fully-unlimited as a
  // safe fallback for any not-yet-migrated rows.
  unlimited: {
    recordingMinutesCount: null,
    collaboratorCount: null,
    guestCount: null,
    adminCount: null,
    jobCount: null,
    jobRecordingCount: null
  }
}

const DEFAULT_ACCOUNT_TIER_PROJECT_LIMITS: Record<AccountTier, AccountTierProjectLimitMap> = {
  // Tier rollback (2026-07-12): no project-COUNT caps at all (NULL = unlimited,
  // including free->premium per operator D2). The matrix mechanism is retained
  // so an operator can impose counts later.
  free: { free: null, premium: null, unlimited: null },
  pro: { free: null, premium: null, unlimited: null }
}

const isMissingTableError = (error: unknown): boolean => {
  return error instanceof Error && /relation .* does not exist/i.test(error.message)
}

export const getDefaultProjectTypeLimitMap = (): Record<ProjectType, ProjectTypeLimit> => DEFAULT_PROJECT_LIMITS

export const getDefaultAccountTierProjectLimitMap = (): Record<AccountTier, AccountTierProjectLimitMap> => DEFAULT_ACCOUNT_TIER_PROJECT_LIMITS

export const getProjectTypeLimitMap = async (): Promise<Record<ProjectType, ProjectTypeLimit>> => {
  const sequelize = getSequelize()

  try {
    const rows = await sequelize.query<ProjectTypeLimitRow>(
      `
        SELECT
          project_type AS "projectType",
          recording_minutes_limit AS "recordingMinutesCount",
          collaborator_limit AS "collaboratorCount",
          guest_limit AS "guestCount",
          admin_limit AS "adminCount",
          analyze_job_limit AS "jobCount",
          job_recording_limit AS "jobRecordingCount"
        FROM ${PROJECT_TYPE_LIMIT_TABLE}
      `,
      { type: QueryTypes.SELECT }
    )

    if (rows.length === 0) return DEFAULT_PROJECT_LIMITS

    return rows.reduce<Record<ProjectType, ProjectTypeLimit>>((acc, row) => {
      acc[row.projectType] = {
        recordingMinutesCount: row.recordingMinutesCount === null ? null : Number(row.recordingMinutesCount),
        collaboratorCount: row.collaboratorCount === null ? null : Number(row.collaboratorCount),
        guestCount: row.guestCount === null ? null : Number(row.guestCount),
        adminCount: row.adminCount === null ? null : Number(row.adminCount),
        jobCount: row.jobCount === null ? null : Number(row.jobCount),
        jobRecordingCount: row.jobRecordingCount === null ? null : Number(row.jobRecordingCount)
      }
      return acc
    }, { ...DEFAULT_PROJECT_LIMITS })
  } catch (error) {
    if (isMissingTableError(error)) return DEFAULT_PROJECT_LIMITS
    if (isMissingAdminLimitColumnError(error)) return await getProjectTypeLimitMapLegacyShape()
    throw error
  }
}

// Deploy-window tolerance (2026-08-17): API may run before migration
// 260817-01 adds admin_limit. Fall back to the old SELECT with adminCount
// unlimited — behavior identical to pre-change production.
const isMissingAdminLimitColumnError = (error: unknown): boolean => {
  return error instanceof Error && /column .*admin_limit.* does not exist/i.test(error.message)
}

const getProjectTypeLimitMapLegacyShape = async (): Promise<Record<ProjectType, ProjectTypeLimit>> => {
  const sequelize = getSequelize()
  const rows = await sequelize.query<Omit<ProjectTypeLimitRow, 'adminCount'>>(
    `
      SELECT
        project_type AS "projectType",
        recording_minutes_limit AS "recordingMinutesCount",
        collaborator_limit AS "collaboratorCount",
        guest_limit AS "guestCount",
        analyze_job_limit AS "jobCount",
        job_recording_limit AS "jobRecordingCount"
      FROM ${PROJECT_TYPE_LIMIT_TABLE}
    `,
    { type: QueryTypes.SELECT }
  )
  if (rows.length === 0) return DEFAULT_PROJECT_LIMITS
  return rows.reduce<Record<ProjectType, ProjectTypeLimit>>((acc, row) => {
    acc[row.projectType] = {
      recordingMinutesCount: row.recordingMinutesCount === null ? null : Number(row.recordingMinutesCount),
      collaboratorCount: row.collaboratorCount === null ? null : Number(row.collaboratorCount),
      guestCount: row.guestCount === null ? null : Number(row.guestCount),
      adminCount: null,
      jobCount: row.jobCount === null ? null : Number(row.jobCount),
      jobRecordingCount: row.jobRecordingCount === null ? null : Number(row.jobRecordingCount)
    }
    return acc
  }, { ...DEFAULT_PROJECT_LIMITS })
}

export const getAccountTierProjectLimitMap = async (accountTier: AccountTier, additionalPremiumProjectSlots: number = 0): Promise<AccountTierProjectLimitMap> => {
  const sequelize = getSequelize()

  try {
    const rows = await sequelize.query<AccountTierProjectLimitRow>(
      `
        SELECT
          project_type AS "projectType",
          active_project_limit AS "activeProjectCount"
        FROM ${ACCOUNT_TIER_PROJECT_LIMIT_TABLE}
        WHERE account_tier = :accountTier
      `,
      { replacements: { accountTier }, type: QueryTypes.SELECT }
    )

    const limits = rows.reduce<AccountTierProjectLimitMap>((acc, row) => {
      acc[row.projectType] = row.activeProjectCount === null ? null : Number(row.activeProjectCount)
      return acc
    }, { ...DEFAULT_ACCOUNT_TIER_PROJECT_LIMITS[accountTier] })

    const premiumBase = limits.premium
    return {
      free: limits.free,
      premium: premiumBase !== null ? premiumBase + additionalPremiumProjectSlots : premiumBase,
      unlimited: limits.unlimited
    }
  } catch (error) {
    if (!isMissingTableError(error)) throw error

    const defaults = DEFAULT_ACCOUNT_TIER_PROJECT_LIMITS[accountTier]
    return {
      free: defaults.free,
      premium: defaults.premium !== null ? defaults.premium + additionalPremiumProjectSlots : defaults.premium,
      unlimited: defaults.unlimited
    }
  }
}
