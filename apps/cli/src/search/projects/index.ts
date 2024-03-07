import { type TCountryCode, getCountryData } from 'countries-list'
import { type Dayjs } from 'dayjs'
import { type Sequelize, QueryTypes } from 'sequelize'

import { masterObjectiveValues } from '@rfcx-bio/common/dao/master-data'

import { BASE_SQL, SYNC_BATCH_LIMIT } from '../constants'
import { type AbbreviatedProject, type ExpandedProject } from '../types'

export const getProjects = async (
  sequelize: Sequelize,
  status: 'eligible' | 'non-eligible',
  constraint?: { type: 'deleted' | 'updated', time?: Dayjs }
): Promise<ExpandedProject[]> => {
  let offset = 0
  let totalCount = 0
  let responseCount = 1

  let completeSql = BASE_SQL

  if (status === 'eligible') {
    console.info('- getProjects: querying projects that are eligible for project directory')
    completeSql += ' (location_project.status = \'listed\' or location_project.status = \'published\')'
  } else {
    console.info('- getProjects: querying projects that are not eligible for project directory')
    completeSql += ' (location_project.status = \'unlisted\' or location_project.status = \'hidden\')'
  }

  if (constraint?.type === 'deleted') {
    if (constraint?.time) {
      console.info('- getProjects: querying projects that are deleted after', constraint?.time?.toISOString())
      completeSql += ' and location_project.deleted_at >= :latest_sync_date'
    } else {
      console.info('- getProjects: querying all deleted projects')
      completeSql += ' and location_project.deleted_at is not null'
    }
  } else {
    console.info('- getProjects: querying all not deleted projects')
    completeSql += ' and location_project.deleted_at is null'
  }

  if (constraint?.type === 'updated') {
    if (constraint?.time) {
      console.info('- getProjects: querying updated projects after', constraint?.time?.toISOString())
      completeSql += ' and (location_project.updated_at >= :latest_sync_date or location_project_profile.updated_at >= :latest_sync_date)'
    }
  }

  completeSql += ' limit :limit offset :offset'

  const projectList: AbbreviatedProject[] = []

  while (responseCount !== 0) {
    console.info('- getProjects: querying projects between limit', SYNC_BATCH_LIMIT, 'and offset', offset)
    const projects = await sequelize.query<AbbreviatedProject>(completeSql, {
      raw: true,
      replacements: {
        limit: SYNC_BATCH_LIMIT,
        offset,
        latest_sync_date: constraint?.time?.toISOString() ?? null
      },
      type: QueryTypes.SELECT
    })

    totalCount += projects.length
    offset += SYNC_BATCH_LIMIT
    responseCount = projects.length

    console.info('- getProjects: found', projects.length, 'projects between limit', SYNC_BATCH_LIMIT, 'and offset', offset)
    projectList.push(...projects)
  }

  console.info('- getProjects: found', totalCount, 'projects in total')
  return projectList.map(p => {
    return {
      ...p,
      expanded_country_names: p.country_codes.map(c => {
        const countryData = getCountryData(c as TCountryCode)
        return countryData?.name ?? ''
      }).filter(c => c !== ''),
      expanded_objectives: p.objectives.map(o => {
        const foundObjective = masterObjectiveValues.find(masterObjective => masterObjective.slug === o)
        return foundObjective?.description ?? o
      })
    }
  })
}
