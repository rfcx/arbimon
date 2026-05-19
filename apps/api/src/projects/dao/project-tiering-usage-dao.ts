import { QueryTypes } from 'sequelize'

import { type ProjectTieringUsage } from '@rfcx-bio/common/api-bio/project/projects'

import { getSequelize } from '~/db'

interface ProjectTieringUsageRow {
  locationProjectId: number
  collaboratorCount: number
  guestCount: number
}

const isMissingUsageViewError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes('location_project_member_quota_usage')
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
          guest_count AS "guestCount"
        FROM location_project_member_quota_usage
        WHERE location_project_id = :locationProjectId
      `,
      { replacements: { locationProjectId }, type: QueryTypes.SELECT }
    )
  } catch (error) {
    if (isMissingUsageViewError(error)) return undefined
    throw error
  }

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
          guest_count AS "guestCount"
        FROM location_project_member_quota_usage
        WHERE location_project_id IN (:locationProjectIds)
      `,
      { replacements: { locationProjectIds }, type: QueryTypes.SELECT }
    )
  } catch (error) {
    if (isMissingUsageViewError(error)) return {}
    throw error
  }

  return rows.reduce<Record<number, ProjectTieringUsage>>((acc, row) => {
    acc[row.locationProjectId] = {
      recordingMinutesCount: 0,
      collaboratorCount: Number(row.collaboratorCount ?? 0),
      guestCount: Number(row.guestCount ?? 0),
      patternMatchingCount: 0
    }
    return acc
  }, {})
}
