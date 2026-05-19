import { QueryTypes } from 'sequelize'

import { type AccountTier, type ProjectType } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '~/db'

export interface ProjectTypeLimit {
  recordingMinutesCount: number | null
  collaboratorCount: number | null
  guestCount: number | null
  jobCount: number | null
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
  jobCount: number | null
}

interface AccountTierProjectLimitRow {
  projectType: ProjectType
  activeProjectCount: number | null
}

const PROJECT_TYPE_LIMIT_TABLE = 'project_type_limit'
const ACCOUNT_TIER_PROJECT_LIMIT_TABLE = 'account_tier_project_limit'

const DEFAULT_PROJECT_LIMITS: Record<ProjectType, ProjectTypeLimit> = {
  free: {
    recordingMinutesCount: 40000,
    collaboratorCount: 0,
    guestCount: 0,
    jobCount: 50
  },
  premium: {
    recordingMinutesCount: 1000000,
    collaboratorCount: 4,
    guestCount: 3,
    jobCount: 200
  },
  unlimited: {
    recordingMinutesCount: null,
    collaboratorCount: null,
    guestCount: null,
    jobCount: null
  }
}

const DEFAULT_ACCOUNT_TIER_PROJECT_LIMITS: Record<AccountTier, AccountTierProjectLimitMap> = {
  free: { free: 5, premium: 0, unlimited: 0 },
  pro: { free: 50, premium: 2, unlimited: 0 },
  enterprise: { free: null, premium: null, unlimited: 1 }
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
          analyze_job_limit AS "jobCount"
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
        jobCount: row.jobCount === null ? null : Number(row.jobCount)
      }
      return acc
    }, { ...DEFAULT_PROJECT_LIMITS })
  } catch (error) {
    if (isMissingTableError(error)) return DEFAULT_PROJECT_LIMITS
    throw error
  }
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
