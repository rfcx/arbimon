import { QueryTypes } from 'sequelize'

import { type SuperProjectLimits, type SuperProjectSummary, type SuperProjectTierUpdateBody, type SuperUserSummary, type SuperUserTierUpdateBody } from '@rfcx-bio/common/api-bio/super/projects'
import { type AccountTier, type ProjectType } from '@rfcx-bio/node-common/dao/types'

import { getSequelize } from '~/db'
import { BioNotFoundError, BioPublicError } from '~/errors'
import { getAccountTierProjectLimitMap, getProjectTypeLimitMap } from '../tiering/tier-limit-bll'

const OWNER_ROLE_ID = 4

interface SuperProjectRow {
  id: number
  idCore: string
  idArbimon: number
  slug: string
  name: string
  status: string
  statusUpdatedAt: Date
  latitudeNorth: number
  latitudeSouth: number
  longitudeEast: number
  longitudeWest: number
  projectType: ProjectType
  isLocked: boolean
  recordingMinutesCount: number
  collaboratorCount: number
  guestCount: number
  patternMatchingCount: number
}

interface SuperUserRow {
  id: number
  email: string
  firstName: string
  lastName: string
  image?: string
  accountTier: AccountTier
  additionalPremiumProjectSlots: number
  ownedProjectCount: number
  freeProjects: number
  premiumProjects: number
  unlimitedProjects: number
}

const mapProjectSummary = (row: SuperProjectRow, limitMap: Record<ProjectType, SuperProjectLimits>): SuperProjectSummary => {
  const projectType = row.projectType ?? 'free'
  return {
    id: row.id,
    idCore: row.idCore,
    idArbimon: row.idArbimon,
    slug: row.slug,
    name: row.name,
    status: row.status as SuperProjectSummary['status'],
    statusUpdatedAt: row.statusUpdatedAt,
    latitudeNorth: Number(row.latitudeNorth ?? 0),
    latitudeSouth: Number(row.latitudeSouth ?? 0),
    longitudeEast: Number(row.longitudeEast ?? 0),
    longitudeWest: Number(row.longitudeWest ?? 0),
    projectType,
    isLocked: Boolean(row.isLocked),
    usage: {
      recordingMinutesCount: Number(row.recordingMinutesCount ?? 0),
      collaboratorCount: Number(row.collaboratorCount ?? 0),
      guestCount: Number(row.guestCount ?? 0),
      patternMatchingCount: Number(row.patternMatchingCount ?? 0)
    },
    limits: limitMap[projectType]
  }
}

export const getProjects = async (keyword?: string, limit: number = 200, offset: number = 0): Promise<SuperProjectSummary[]> => {
  const sequelize = getSequelize()
  const projectTypeLimits = await getProjectTypeLimitMap()
  const rows = await sequelize.query<SuperProjectRow>(
    `
      SELECT
        lp.id AS "id",
        lp.id_core AS "idCore",
        lp.id_arbimon AS "idArbimon",
        lp.slug AS "slug",
        lp.name AS "name",
        lp.status AS "status",
        lp.status_updated_at AS "statusUpdatedAt",
        lp.latitude_north AS "latitudeNorth",
        lp.latitude_south AS "latitudeSouth",
        lp.longitude_east AS "longitudeEast",
        lp.longitude_west AS "longitudeWest",
        COALESCE(lp.project_type, 'free') AS "projectType",
        COALESCE(lp.is_locked, FALSE) AS "isLocked",
        0 AS "recordingMinutesCount",
        COALESCE(lpmqu.collaborator_count, 0) AS "collaboratorCount",
        COALESCE(lpmqu.guest_count, 0) AS "guestCount",
        0 AS "patternMatchingCount"
      FROM location_project lp
      LEFT JOIN location_project_member_quota_usage lpmqu
        ON lp.id = lpmqu.location_project_id
      WHERE (:keyword::TEXT IS NULL OR lp.name ILIKE '%' || :keyword || '%' OR lp.slug ILIKE '%' || :keyword || '%')
      ORDER BY lp.name, lp.id
      LIMIT :limit OFFSET :offset
    `,
    { replacements: { keyword: keyword ?? null, limit, offset }, type: QueryTypes.SELECT }
  )

  return rows.map(row => mapProjectSummary(row, projectTypeLimits))
}

export const getUsers = async (keyword?: string, limit: number = 200, offset: number = 0): Promise<SuperUserSummary[]> => {
  const sequelize = getSequelize()
  const rows = await sequelize.query<SuperUserRow>(
    `
      SELECT
        up.id AS "id",
        up.email AS "email",
        up.first_name AS "firstName",
        up.last_name AS "lastName",
        up.image AS "image",
        COALESCE(up.account_tier, 'free') AS "accountTier",
        COALESCE(up.additional_premium_project_slots, 0) AS "additionalPremiumProjectSlots",
        COUNT(lpur.location_project_id)::INTEGER AS "ownedProjectCount",
        COUNT(lp.id) FILTER (WHERE COALESCE(lp.project_type, 'free') = 'free')::INTEGER AS "freeProjects",
        COUNT(lp.id) FILTER (WHERE COALESCE(lp.project_type, 'free') = 'premium')::INTEGER AS "premiumProjects",
        COUNT(lp.id) FILTER (WHERE COALESCE(lp.project_type, 'free') = 'unlimited')::INTEGER AS "unlimitedProjects"
      FROM user_profile up
      LEFT JOIN location_project_user_role lpur
        ON up.id = lpur.user_id
        AND lpur.role_id = :ownerRoleId
      LEFT JOIN location_project lp
        ON lp.id = lpur.location_project_id
      WHERE (
        :keyword::TEXT IS NULL OR
        up.email ILIKE '%' || :keyword || '%' OR
        up.first_name ILIKE '%' || :keyword || '%' OR
        up.last_name ILIKE '%' || :keyword || '%'
      )
      GROUP BY up.id
      ORDER BY up.email, up.id
      LIMIT :limit OFFSET :offset
    `,
    { replacements: { keyword: keyword ?? null, limit, offset, ownerRoleId: OWNER_ROLE_ID }, type: QueryTypes.SELECT }
  )

  const portfolioLimitCache = new Map<string, Awaited<ReturnType<typeof getAccountTierProjectLimitMap>>>()

  return await Promise.all(rows.map(async row => {
    const additionalPremiumProjectSlots = Number(row.additionalPremiumProjectSlots ?? 0)
    const cacheKey = `${row.accountTier}:${additionalPremiumProjectSlots}`
    const limits = portfolioLimitCache.get(cacheKey) ?? await getAccountTierProjectLimitMap(row.accountTier, additionalPremiumProjectSlots)
    portfolioLimitCache.set(cacheKey, limits)

    return {
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      image: row.image,
      accountTier: row.accountTier,
      additionalPremiumProjectSlots,
      ownedProjectCount: Number(row.ownedProjectCount ?? 0),
      limits: {
        freeProjects: limits.free,
        premiumProjects: limits.premium,
        unlimitedProjects: limits.unlimited
      },
      usage: {
        freeProjects: Number(row.freeProjects ?? 0),
        premiumProjects: Number(row.premiumProjects ?? 0),
        unlimitedProjects: Number(row.unlimitedProjects ?? 0)
      }
    }
  }))
}

export const getUserProjects = async (userId: number): Promise<SuperProjectSummary[]> => {
  const sequelize = getSequelize()
  const projectTypeLimits = await getProjectTypeLimitMap()
  const rows = await sequelize.query<SuperProjectRow>(
    `
      SELECT
        lp.id AS "id",
        lp.id_core AS "idCore",
        lp.id_arbimon AS "idArbimon",
        lp.slug AS "slug",
        lp.name AS "name",
        lp.status AS "status",
        lp.status_updated_at AS "statusUpdatedAt",
        lp.latitude_north AS "latitudeNorth",
        lp.latitude_south AS "latitudeSouth",
        lp.longitude_east AS "longitudeEast",
        lp.longitude_west AS "longitudeWest",
        COALESCE(lp.project_type, 'free') AS "projectType",
        COALESCE(lp.is_locked, FALSE) AS "isLocked",
        0 AS "recordingMinutesCount",
        COALESCE(lpmqu.collaborator_count, 0) AS "collaboratorCount",
        COALESCE(lpmqu.guest_count, 0) AS "guestCount",
        0 AS "patternMatchingCount"
      FROM location_project lp
      INNER JOIN location_project_user_role lpur
        ON lp.id = lpur.location_project_id
        AND lpur.role_id = :ownerRoleId
      LEFT JOIN location_project_member_quota_usage lpmqu
        ON lp.id = lpmqu.location_project_id
      WHERE lpur.user_id = :userId
      ORDER BY lp.name, lp.id
    `,
    { replacements: { userId, ownerRoleId: OWNER_ROLE_ID }, type: QueryTypes.SELECT }
  )

  return rows.map(row => mapProjectSummary(row, projectTypeLimits))
}

export const updateProjectTier = async (projectId: number, body: SuperProjectTierUpdateBody): Promise<void> => {
  const sequelize = getSequelize()

  if (body.projectType !== undefined && !['free', 'premium', 'unlimited'].includes(body.projectType)) {
    throw new BioPublicError('Invalid project tier.', 400)
  }
  if (body.projectType === undefined && body.isLocked === undefined) {
    throw new BioPublicError('No project update provided.', 400)
  }

  const rows = await sequelize.query<{ id: number }>(
    `
      UPDATE location_project
      SET
        project_type = COALESCE(:projectType, project_type),
        is_locked = COALESCE(:isLocked, is_locked),
        updated_at = CURRENT_TIMESTAMP,
        status = CASE
          WHEN COALESCE(:projectType, project_type) IN ('premium', 'unlimited') AND status <> 'hidden' THEN 'unlisted'
          WHEN COALESCE(:projectType, project_type) = 'free' AND status = 'hidden' THEN 'listed'
          ELSE status
        END
      WHERE id = :projectId
      RETURNING id
    `,
    { replacements: { projectId, projectType: body.projectType ?? null, isLocked: body.isLocked ?? null }, type: QueryTypes.SELECT }
  )

  if (rows.length === 0) {
    throw BioNotFoundError()
  }
}

export const updateUserTier = async (userId: number, body: SuperUserTierUpdateBody): Promise<void> => {
  const sequelize = getSequelize()

  if (!['free', 'pro', 'enterprise'].includes(body.accountTier)) {
    throw new BioPublicError('Invalid account tier.', 400)
  }

  const rows = await sequelize.query<{ id: number }>(
    `
      UPDATE user_profile
      SET
        account_tier = :accountTier,
        additional_premium_project_slots = :additionalPremiumProjectSlots,
        account_tier_updated_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = :userId
      RETURNING id
    `,
    { replacements: { userId, accountTier: body.accountTier, additionalPremiumProjectSlots: body.additionalPremiumProjectSlots }, type: QueryTypes.SELECT }
  )

  if (rows.length === 0) {
    throw BioNotFoundError()
  }
}
