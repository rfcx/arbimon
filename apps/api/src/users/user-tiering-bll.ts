import { QueryTypes } from 'sequelize'

import { type PortfolioSummaryResponse, type SubmitTierChangeRequestBody, type SubmitTierChangeResponse } from '@rfcx-bio/common/api-bio/users/tiering'
import { type AccountTier, type ProjectEntitlementState, type ProjectType } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '~/db'
import { BioPublicError } from '~/errors'
import { getAccountTierProjectLimitMap } from '../tiering/tier-limit-bll'

const TIER_CHANGE_REQUEST_TABLE = 'account_tier_change_request'
const TIER_CHANGE_SELECTION_TABLE = 'account_tier_change_project_selection'

const ACCOUNT_TIER_ORDER: AccountTier[] = ['free', 'pro', 'enterprise']
interface PortfolioProjectRow {
  locationProjectId: number
  slug: string
  name: string
  projectType: ProjectType
  entitlementState: ProjectEntitlementState
  viewOnlyEffective: boolean
  recordingMinutesCount: number
  collaboratorCount: number
  guestCount: number
  patternMatchingCount: number
}

interface UserTierRow {
  accountTier: AccountTier
  additionalPremiumProjectSlots: number
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
        COALESCE(additional_premium_project_slots, 0) AS "additionalPremiumProjectSlots"
      FROM user_profile
      WHERE id = :userId
      LIMIT 1
    `,
    { replacements: { userId }, type: QueryTypes.SELECT }
  )

  return {
    accountTier: rows[0]?.accountTier ?? 'free',
    additionalPremiumProjectSlots: Number(rows[0]?.additionalPremiumProjectSlots ?? 0)
  }
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
        COALESCE(lp.entitlement_state, 'active') AS "entitlementState",
        COALESCE(lp.view_only_effective, FALSE) AS "viewOnlyEffective",
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
      ORDER BY lp.name
    `,
    { replacements: { userId }, type: QueryTypes.SELECT }
  )
}

const toUsageCounts = (projects: PortfolioProjectRow[]): PortfolioSummaryResponse['usage'] => {
  return projects.reduce(
    (acc, project) => {
      if (project.entitlementState !== 'active') return acc
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
    pro: { premium: 0, free: 1, unlimited: 2 },
    enterprise: { unlimited: 0, premium: 1, free: 2 }
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
    const limit = selection.selectedEntitlementState === 'active' ? limits[selection.selectedProjectType] : 0
    const canStayActive = limit === null || counters[selection.selectedProjectType] < limit

    const normalizedState: ProjectEntitlementState = selection.selectedEntitlementState === 'active' && canStayActive
      ? 'active'
      : 'inactive'

    if (normalizedState === 'active') counters[selection.selectedProjectType] += 1

    return {
      ...selection,
      selectedEntitlementState: normalizedState
    }
  })
}

export const getPortfolioSummary = async (userId: number): Promise<PortfolioSummaryResponse> => {
  const { accountTier, additionalPremiumProjectSlots } = await getUserTierRow(userId)
  const ownedProjects = await getPortfolioProjectRows(userId)
  const usage = toUsageCounts(ownedProjects)

  const limits = await getAccountTierProjectLimitMap(accountTier, additionalPremiumProjectSlots)
  return {
    accountTier,
    additionalPremiumProjectSlots,
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
  const { accountTier } = await getUserTierRow(userId)

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
        selectedEntitlementState: 'inactive' as ProjectEntitlementState
      }))
  ]

  const nextTierLimits = await getAccountTierProjectLimitMap(body.toTier, 0)
  const normalizedSelections = normalizeSelectionsForTier(body.toTier, nextTierLimits, completedSelections)

  return await sequelize.transaction(async (transaction) => {
    const requestRows = await sequelize.query<{ id: number }>(
      `
        INSERT INTO ${TIER_CHANGE_REQUEST_TABLE} (
          user_profile_id,
          from_tier,
          to_tier,
          status,
          submitted_at,
          processed_at,
          metadata,
          created_at,
          updated_at
        )
        VALUES (
          :userId,
          :fromTier,
          :toTier,
          'applied',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP,
          '{}'::jsonb,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        RETURNING id
      `,
      {
        replacements: { userId, fromTier: accountTier, toTier: body.toTier },
        type: QueryTypes.SELECT,
        transaction
      }
    )

    const requestId = Number(requestRows[0]?.id ?? 0)
    if (requestId <= 0) {
      throw new BioPublicError('Failed to record the tier change request.', 500)
    }

    for (const selection of normalizedSelections) {
      await sequelize.query(
        `
          INSERT INTO ${TIER_CHANGE_SELECTION_TABLE} (
            account_tier_change_request_id,
            location_project_id,
            selected_project_type,
            selected_entitlement_state,
            selection_reason,
            created_at,
            updated_at
          )
          VALUES (
            :requestId,
            :locationProjectId,
            :selectedProjectType,
            :selectedEntitlementState,
            :selectionReason,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `,
        {
          replacements: {
            requestId,
            locationProjectId: selection.locationProjectId,
            selectedProjectType: selection.selectedProjectType,
            selectedEntitlementState: selection.selectedEntitlementState,
            selectionReason: selection.selectedEntitlementState === 'active' ? 'user_selected' : 'downgrade_over_limit'
          },
          transaction
        }
      )

      await sequelize.query(
        `
          UPDATE location_project
          SET
            project_type = :projectType,
            entitlement_state = :entitlementState,
            entitlement_updated_at = CURRENT_TIMESTAMP,
            entitlement_inactivated_reason = :inactivatedReason,
            downgrade_locked = CASE WHEN :entitlementState = 'inactive' THEN TRUE ELSE FALSE END,
            view_only_effective = CASE WHEN :entitlementState = 'inactive' THEN TRUE ELSE FALSE END,
            status = CASE
              WHEN :projectType = 'free' THEN CASE WHEN status = 'hidden' THEN 'listed' ELSE status END
              ELSE status
            END
          WHERE id = :locationProjectId
        `,
        {
          replacements: {
            locationProjectId: selection.locationProjectId,
            projectType: selection.selectedProjectType,
            entitlementState: selection.selectedEntitlementState,
            inactivatedReason: selection.selectedEntitlementState === 'inactive' ? 'downgrade_over_limit' : null
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

    return {
      requestId,
      accountTier: body.toTier,
      projectsUpdated: normalizedSelections.length
    }
  })
}
