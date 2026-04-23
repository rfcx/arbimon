import { QueryTypes } from 'sequelize'

import { type AccountTier, type ProjectType } from '@rfcx-bio/node-common/dao/types'
import { type ProjectRole, getIdByRole } from '@rfcx-bio/common/roles'
import { ModelRepository } from '@rfcx-bio/node-common/dao/model-repository'

import { getSequelize } from '~/db'
import { BioNotFoundError, BioPublicError } from '~/errors'
import { getAccountTierProjectLimitMap, getProjectTypeLimitMap } from '../tiering/tier-limit-bll'
import { getProjectTieringUsage } from './dao/project-tiering-usage-dao'
import { getProjectById } from './dao/projects-dao'

interface OwnedProjectTypeCountsRow {
  projectType: ProjectType
  count: number
}

interface OwnedProjectTypeCounts {
  free: number
  premium: number
  unlimited: number
}

const OWNER_ROLE_ID = getIdByRole('owner')
const GUEST_ROLE_ID = getIdByRole('viewer')

const isUnlimited = (value: number | null): value is null => value === null

const getAccountTierForUser = async (userId: number): Promise<{ accountTier: AccountTier, additionalPremiumProjectSlots: number }> => {
  const sequelize = getSequelize()
  const { UserProfile } = ModelRepository.getInstance(sequelize)
  const user = await UserProfile.findByPk(userId, {
    attributes: ['accountTier', 'additionalPremiumProjectSlots'],
    raw: true
  })

  return {
    accountTier: user?.accountTier ?? 'free',
    additionalPremiumProjectSlots: Number(user?.additionalPremiumProjectSlots ?? 0)
  }
}

const getOwnedActiveProjectTypeCounts = async (userId: number): Promise<OwnedProjectTypeCounts> => {
  const sequelize = getSequelize()
  const rows = await sequelize.query<OwnedProjectTypeCountsRow>(
    `
      SELECT
        COALESCE(lp.project_type, 'free') AS "projectType",
        COUNT(*)::INTEGER AS "count"
      FROM location_project lp
      INNER JOIN location_project_user_role lpur
        ON lp.id = lpur.location_project_id
      WHERE lpur.user_id = :userId
        AND lpur.role_id = :ownerRoleId
        AND COALESCE(lp.entitlement_state, 'active') = 'active'
      GROUP BY COALESCE(lp.project_type, 'free')
    `,
    { replacements: { userId, ownerRoleId: OWNER_ROLE_ID }, type: QueryTypes.SELECT }
  )

  return rows.reduce<OwnedProjectTypeCounts>((acc, row) => {
    acc[row.projectType] = Number(row.count ?? 0)
    return acc
  }, { free: 0, premium: 0, unlimited: 0 })
}

const getProjectTypeLimit = async (userId: number, projectType: ProjectType): Promise<number | null> => {
  const { accountTier, additionalPremiumProjectSlots } = await getAccountTierForUser(userId)
  const limits = await getAccountTierProjectLimitMap(accountTier, additionalPremiumProjectSlots)
  return limits[projectType]
}

const getMemberBucket = (role: Exclude<ProjectRole, 'none' | 'external'>): 'guest' | 'collaborator' | 'owner' => {
  if (role === 'owner') return 'owner'
  if (role === 'viewer') return 'guest'
  return 'collaborator'
}

export const assertCanCreateProject = async (userId: number, projectType: ProjectType): Promise<void> => {
  const limit = await getProjectTypeLimit(userId, projectType)
  if (limit === 0) {
    throw new BioPublicError(`Current account tier does not allow creating ${projectType} projects.`, 403)
  }

  if (isUnlimited(limit)) return

  const counts = await getOwnedActiveProjectTypeCounts(userId)
  if (counts[projectType] >= limit) {
    throw new BioPublicError(`Current account tier has reached the limit for active ${projectType} projects.`, 403)
  }
}

export const assertProjectSettingsUpdateAllowed = async (projectId: number, request: { hidden?: boolean }): Promise<void> => {
  const project = await getProjectById(projectId)
  if (project === undefined) throw BioNotFoundError()

  if (project.entitlementState === 'inactive' || project.viewOnlyEffective === true) {
    throw new BioPublicError('This project is currently view-only and cannot be edited.', 403)
  }

  if (request.hidden === true && (project.projectType ?? 'free') === 'free') {
    throw new BioPublicError('Free projects must remain public.', 400)
  }
}

export const assertProjectAnalysisAllowed = async (projectId: number): Promise<void> => {
  const project = await getProjectById(projectId)
  if (project === undefined) throw BioNotFoundError()

  if (project.entitlementState === 'inactive' || project.viewOnlyEffective === true) {
    throw new BioPublicError('This project is currently view-only and cannot run analyses.', 403)
  }
}

export const assertProjectExportAllowed = async (projectId: number): Promise<void> => {
  const project = await getProjectById(projectId)
  if (project === undefined) throw BioNotFoundError()

  if (project.entitlementState === 'inactive' || project.viewOnlyEffective === true) {
    throw new BioPublicError('This project is currently view-only and cannot request exports or backups.', 403)
  }
}

export const assertProjectMemberUpdateAllowed = async (locationProjectId: number, requestedRole: Exclude<ProjectRole, 'none' | 'external'>, currentRole?: Exclude<ProjectRole, 'none' | 'external'>): Promise<void> => {
  const project = await getProjectById(locationProjectId)
  if (project === undefined) throw BioNotFoundError()

  if (project.entitlementState === 'inactive' || project.viewOnlyEffective === true) {
    throw new BioPublicError('This project is currently view-only and cannot be changed.', 403)
  }

  const projectType = project.projectType ?? 'free'
  const projectLimits = await getProjectTypeLimitMap()
  const limits = projectLimits[projectType]

  const nextBucket = getMemberBucket(requestedRole)
  if (nextBucket === 'owner') return

  const currentBucket = currentRole === undefined ? undefined : getMemberBucket(currentRole)
  if (currentBucket === nextBucket) return

  const usage = await getProjectTieringUsage(locationProjectId)
  const collaboratorCount = usage?.collaboratorCount ?? 0
  const guestCount = usage?.guestCount ?? 0

  if (nextBucket === 'collaborator' && limits.collaboratorCount !== null && collaboratorCount >= limits.collaboratorCount) {
    throw new BioPublicError(`${projectType} projects support up to ${limits.collaboratorCount} collaborators.`, 403)
  }

  if (nextBucket === 'guest' && limits.guestCount !== null && guestCount >= limits.guestCount) {
    throw new BioPublicError(`${projectType} projects support up to ${limits.guestCount} guests.`, 403)
  }
}

export const getCurrentProjectRole = async (locationProjectId: number, userId: number): Promise<Exclude<ProjectRole, 'none' | 'external'> | undefined> => {
  const sequelize = getSequelize()
  const row = await sequelize.query<{ roleId: number }>(
    `
      SELECT role_id AS "roleId"
      FROM location_project_user_role
      WHERE location_project_id = :locationProjectId
        AND user_id = :userId
      LIMIT 1
    `,
    { replacements: { locationProjectId, userId }, type: QueryTypes.SELECT }
  )

  const roleId = row[0]?.roleId
  if (roleId === undefined) return undefined
  if (roleId === GUEST_ROLE_ID) return 'viewer'
  if (roleId === OWNER_ROLE_ID) return 'owner'
  if (roleId === getIdByRole('admin')) return 'admin'
  if (roleId === getIdByRole('expert')) return 'expert'
  if (roleId === getIdByRole('user')) return 'user'
  if (roleId === getIdByRole('entry')) return 'entry'
  return undefined
}
