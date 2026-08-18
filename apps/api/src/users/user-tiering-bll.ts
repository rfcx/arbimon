import { QueryTypes } from 'sequelize'

import { type PortfolioMemberTotals, type PortfolioSummaryResponse, type SubmitTierChangeRequestBody, type SubmitTierChangeResponse } from '@rfcx-bio/common/api-bio/users/tiering'
import { type AccountTier, type ProjectType } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '~/db'
import { BioPublicError } from '~/errors'
import { getAccountTierProjectLimitMap } from '../tiering/tier-limit-bll'

const ACCOUNT_TIER_ORDER: AccountTier[] = ['free', 'pro']

interface PortfolioProjectRow {
  locationProjectId: number
  slug: string
  name: string
  projectType: ProjectType
  isLocked: boolean
  recordingMinutesCount: number
  collaboratorCount: number
  guestCount: number
  patternMatchingCount: number
}

interface UserTierRow {
  accountTier: AccountTier
  additionalPremiumProjectSlots: number
  accountTierUpdatedAt: string | null
}

const isTierDowngrade = (fromTier: AccountTier, toTier: AccountTier): boolean => {
  return ACCOUNT_TIER_ORDER.indexOf(toTier) < ACCOUNT_TIER_ORDER.indexOf(fromTier)
}

const getUserTierRow = async (userId: number): Promise<UserTierRow> => {
  const sequelize = getSequelize()
  const rows = await sequelize.query<UserTierRow>(
    `
      SELECT
        COALESCE(account_tier, 'free') AS "accountTier",
        COALESCE(additional_premium_project_slots, 0) AS "additionalPremiumProjectSlots",
        account_tier_updated_at AS "accountTierUpdatedAt"
      FROM user_profile
      WHERE id = :userId
      LIMIT 1
    `,
    { replacements: { userId }, type: QueryTypes.SELECT }
  )

  return {
    accountTier: rows[0]?.accountTier ?? 'free',
    additionalPremiumProjectSlots: Number(rows[0]?.additionalPremiumProjectSlots ?? 0),
    accountTierUpdatedAt: rows[0]?.accountTierUpdatedAt ?? null
  }
}

/**
 * Composite totals across every project the user BELONGS to (ANY role — owner,
 * admin, member, guest), not just owned projects. Metrics come from the
 * `location_project_metric` materialized view (same source the per-project
 * dashboard reads via dashboard-metrics-dao), LEFT-joined so metric-less
 * projects still count toward projectCount.
 */
const getMemberTotals = async (userId: number): Promise<PortfolioMemberTotals> => {
  const sequelize = getSequelize()
  const rows = await sequelize.query<{ projectCount: number, recordingCount: number, siteCount: number }>(
    `
      SELECT
        COUNT(DISTINCT lp.id) AS "projectCount",
        COALESCE(SUM(lpm.recording_minutes_count), 0) AS "recordingCount",
        COALESCE(SUM(lpm.site_count), 0) AS "siteCount"
      FROM location_project lp
      INNER JOIN location_project_user_role lpur
        ON lp.id = lpur.location_project_id
      LEFT JOIN location_project_metric lpm
        ON lp.id = lpm.location_project_id
      WHERE lpur.user_id = :userId
        AND lp.deleted_at IS NULL
    `,
    { replacements: { userId }, type: QueryTypes.SELECT }
  )
  const row = rows[0]
  return {
    projectCount: Number(row?.projectCount ?? 0),
    recordingCount: Number(row?.recordingCount ?? 0),
    siteCount: Number(row?.siteCount ?? 0)
  }
}

/**
 * PROVISIONAL expiry derivation (2026-08-18): the schema carries NO
 * billing/expiration column — only `account_tier_updated_at`. For Pro
 * accounts, assume an annual term from the last tier change. Clearly a
 * placeholder until real billing data exists; the response field is documented
 * as such and the UI renders it subtly.
 */
const deriveTierExpiry = (tier: AccountTier, tierUpdatedAt: string | null): string | undefined => {
  if (tier !== 'pro' || tierUpdatedAt === null) return undefined
  const updated = new Date(tierUpdatedAt)
  if (Number.isNaN(updated.getTime())) return undefined
  const expires = new Date(updated)
  expires.setUTCFullYear(expires.getUTCFullYear() + 1)
  return expires.toISOString()
}

const getPortfolioProjectRows = async (userId: number): Promise<PortfolioProjectRow[]> => {
  const sequelize = getSequelize()
  return await sequelize.query<PortfolioProjectRow>(
    `
      SELECT
        lp.id AS "locationProjectId",
        lp.slug AS "slug",
        lp.name AS "name",
        COALESCE(lp.project_type, 'free') AS "projectType",
        COALESCE(lp.is_locked, FALSE) AS "isLocked",
        0 AS "recordingMinutesCount",
        COALESCE(lpmqu.collaborator_count, 0) AS "collaboratorCount",
        COALESCE(lpmqu.guest_count, 0) AS "guestCount",
        0 AS "patternMatchingCount"
      FROM location_project lp
      INNER JOIN location_project_user_role lpur
        ON lp.id = lpur.location_project_id
      LEFT JOIN location_project_member_quota_usage lpmqu
        ON lp.id = lpmqu.location_project_id
      WHERE lpur.user_id = :userId
        AND lpur.role_id = 4
        AND lp.deleted_at IS NULL
      ORDER BY lp.name
    `,
    { replacements: { userId }, type: QueryTypes.SELECT }
  )
}

const toUsageCounts = (projects: PortfolioProjectRow[]): PortfolioSummaryResponse['usage'] => {
  return projects.reduce(
    (acc, project) => {
      if (project.isLocked) return acc
      if (project.projectType === 'free') acc.freeProjects += 1
      if (project.projectType === 'premium') acc.premiumProjects += 1
      if (project.projectType === 'unlimited') acc.unlimitedProjects += 1
      return acc
    },
    { freeProjects: 0, premiumProjects: 0, unlimitedProjects: 0 }
  )
}

const sortSelectionsForTier = (toTier: AccountTier, projects: SubmitTierChangeRequestBody['selections']): SubmitTierChangeRequestBody['selections'] => {
  const preferredTypeOrder: Record<AccountTier, Record<ProjectType, number>> = {
    free: { free: 0, premium: 1, unlimited: 2 },
    pro: { premium: 0, free: 1, unlimited: 2 }
  }

  return [...projects].sort((a, b) => {
    const typeDelta = preferredTypeOrder[toTier][a.selectedProjectType] - preferredTypeOrder[toTier][b.selectedProjectType]
    if (typeDelta !== 0) return typeDelta
    return a.locationProjectId - b.locationProjectId
  })
}

const normalizeSelectionsForTier = (
  toTier: AccountTier,
  limits: Record<ProjectType, number | null>,
  selections: SubmitTierChangeRequestBody['selections']
): SubmitTierChangeRequestBody['selections'] => {
  const sorted = sortSelectionsForTier(toTier, selections)
  const counters = { free: 0, premium: 0, unlimited: 0 }

  return sorted.map(selection => {
    const limit = selection.isLocked ? 0 : limits[selection.selectedProjectType]
    const canStayUnlocked = limit === null || counters[selection.selectedProjectType] < limit
    const isLocked = selection.isLocked || !canStayUnlocked

    if (!isLocked) counters[selection.selectedProjectType] += 1

    return {
      ...selection,
      isLocked
    }
  })
}

export const getPortfolioSummary = async (userId: number): Promise<PortfolioSummaryResponse> => {
  const { accountTier, additionalPremiumProjectSlots, accountTierUpdatedAt } = await getUserTierRow(userId)
  const [ownedProjects, memberTotals] = await Promise.all([
    getPortfolioProjectRows(userId),
    getMemberTotals(userId)
  ])
  const usage = toUsageCounts(ownedProjects)

  const limits = await getAccountTierProjectLimitMap(accountTier, additionalPremiumProjectSlots)
  return {
    accountTier,
    accountTierExpiresAt: deriveTierExpiry(accountTier, accountTierUpdatedAt),
    additionalPremiumProjectSlots,
    memberTotals,
    limits: {
      freeProjects: limits.free,
      premiumProjects: limits.premium,
      unlimitedProjects: limits.unlimited
    },
    usage,
    ownedProjects
  }
}

export const submitTierChange = async (userId: number, body: SubmitTierChangeRequestBody): Promise<SubmitTierChangeResponse> => {
  const sequelize = getSequelize()
  const { accountTier, additionalPremiumProjectSlots } = await getUserTierRow(userId)

  if (!isTierDowngrade(accountTier, body.toTier)) {
    throw new BioPublicError('Only tier downgrades are supported from this workflow.', 400)
  }

  const currentProjects = await getPortfolioProjectRows(userId)
  const currentProjectIds = new Set(currentProjects.map(project => project.locationProjectId))
  const selectedIds = new Set(body.selections.map(selection => selection.locationProjectId))

  for (const selection of body.selections) {
    if (!currentProjectIds.has(selection.locationProjectId)) {
      throw new BioPublicError(`Project ${selection.locationProjectId} is not owned by the current user.`, 400)
    }
  }

  const completedSelections = [
    ...body.selections,
    ...currentProjects
      .filter(project => !selectedIds.has(project.locationProjectId))
      .map(project => ({
        locationProjectId: project.locationProjectId,
        selectedProjectType: project.projectType,
        isLocked: true
      }))
  ]

  const nextTierLimits = await getAccountTierProjectLimitMap(body.toTier, additionalPremiumProjectSlots)
  const normalizedSelections = normalizeSelectionsForTier(body.toTier, nextTierLimits, completedSelections)

  await sequelize.transaction(async (transaction) => {
    for (const selection of normalizedSelections) {
      await sequelize.query(
        `
          UPDATE location_project
          SET
            project_type = :projectType,
            is_locked = :isLocked,
            status = CASE
              WHEN :projectType IN ('premium', 'unlimited') AND status <> 'hidden' THEN 'unlisted'
              WHEN :projectType = 'free' THEN CASE WHEN status = 'hidden' THEN 'listed' ELSE status END
              ELSE status
            END
          WHERE id = :locationProjectId
        `,
        {
          replacements: {
            locationProjectId: selection.locationProjectId,
            projectType: selection.selectedProjectType,
            isLocked: selection.isLocked
          },
          transaction
        }
      )
    }

    await sequelize.query(
      `
        UPDATE user_profile
        SET
          account_tier = :toTier,
          account_tier_updated_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = :userId
      `,
      {
        replacements: { toTier: body.toTier, userId },
        transaction
      }
    )
  })

  return {
    accountTier: body.toTier,
    projectsUpdated: normalizedSelections.length
  }
}
