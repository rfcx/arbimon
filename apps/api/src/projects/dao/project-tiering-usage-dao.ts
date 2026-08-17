import { QueryTypes } from 'sequelize'

import { type ProjectTieringUsage } from '@rfcx-bio/common/api-bio/project/projects'

import { getSequelize } from '~/db'

interface ProjectTieringUsageRow {
  locationProjectId: number
  collaboratorCount: number
  guestCount: number
  adminCount: number | null
}

const isMissingUsageViewError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes('location_project_member_quota_usage')
}

// Deploy-window tolerance (2026-08-17): the API can go live before the
// 260817-01 migration adds admin_count to the view (CD deploys on merge; the
// migrate Job is manual-after). Until the column exists, fall back to the old
// SELECT and report adminCount as undefined (guards treat it as ungated).
const isMissingAdminCountError = (error: unknown): boolean => {
  return error instanceof Error && /column .*admin_count.* does not exist/i.test(error.message)
}

export const getProjectTieringUsage = async (locationProjectId: number): Promise<ProjectTieringUsage | undefined> => {
  const sequelize = getSequelize()
  let rows: ProjectTieringUsageRow[]
  try {
    rows = await sequelize.query<ProjectTieringUsageRow>(
      `
        SELECT
          location_project_id AS "locationProjectId",
          collaborator_count AS "collaboratorCount",
          guest_count AS "guestCount",
          admin_count AS "adminCount"
        FROM location_project_member_quota_usage
        WHERE location_project_id = :locationProjectId
      `,
      { replacements: { locationProjectId }, type: QueryTypes.SELECT }
    )
  } catch (error) {
    if (isMissingUsageViewError(error)) return undefined
    if (isMissingAdminCountError(error)) return await getProjectTieringUsageLegacyShape(locationProjectId)
    throw error
  }

  const row = rows[0]
  if (row == null) return undefined
  return {
    recordingMinutesCount: 0,
    collaboratorCount: Number(row.collaboratorCount ?? 0),
    guestCount: Number(row.guestCount ?? 0),
    adminCount: Number(row.adminCount ?? 0),
    patternMatchingCount: 0
  }
}

const getProjectTieringUsageLegacyShape = async (locationProjectId: number): Promise<ProjectTieringUsage | undefined> => {
  const sequelize = getSequelize()
  const rows = await sequelize.query<Omit<ProjectTieringUsageRow, 'adminCount'>>(
    `
      SELECT
        location_project_id AS "locationProjectId",
        collaborator_count AS "collaboratorCount",
        guest_count AS "guestCount"
      FROM location_project_member_quota_usage
      WHERE location_project_id = :locationProjectId
    `,
    { replacements: { locationProjectId }, type: QueryTypes.SELECT }
  )
  const row = rows[0]
  if (row == null) return undefined
  return {
    recordingMinutesCount: 0,
    collaboratorCount: Number(row.collaboratorCount ?? 0),
    guestCount: Number(row.guestCount ?? 0),
    patternMatchingCount: 0
  }
}

export const getProjectsTieringUsage = async (locationProjectIds: number[]): Promise<Record<number, ProjectTieringUsage>> => {
  if (locationProjectIds.length === 0) return {}

  const sequelize = getSequelize()
  let rows: ProjectTieringUsageRow[]
  try {
    rows = await sequelize.query<ProjectTieringUsageRow>(
      `
        SELECT
          location_project_id AS "locationProjectId",
          collaborator_count AS "collaboratorCount",
          guest_count AS "guestCount",
          admin_count AS "adminCount"
        FROM location_project_member_quota_usage
        WHERE location_project_id IN (:locationProjectIds)
      `,
      { replacements: { locationProjectIds }, type: QueryTypes.SELECT }
    )
  } catch (error) {
    if (isMissingUsageViewError(error)) return {}
    if (isMissingAdminCountError(error)) {
      const entries = await Promise.all(locationProjectIds.map(async id => [id, await getProjectTieringUsageLegacyShape(id)] as const))
      return Object.fromEntries(entries.filter(([, v]) => v !== undefined)) as Record<number, ProjectTieringUsage>
    }
    throw error
  }

  return rows.reduce<Record<number, ProjectTieringUsage>>((acc, row) => {
    acc[row.locationProjectId] = {
      recordingMinutesCount: 0,
      collaboratorCount: Number(row.collaboratorCount ?? 0),
      guestCount: Number(row.guestCount ?? 0),
      adminCount: Number(row.adminCount ?? 0),
      patternMatchingCount: 0
    }
    return acc
  }, {})
}
