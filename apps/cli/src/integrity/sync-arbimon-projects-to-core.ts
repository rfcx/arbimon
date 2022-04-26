import { QueryTypes } from 'sequelize'

import { getArbimonSequelize } from '@/data-ingest/_connections/arbimon'
import { ApiCoreClient } from '~/api-core/api-core-client'
import { requireEnv } from '~/env'

interface ArbimonProject {
  name: string
  description: string
  is_private: 0 | 1
  project_id: number
}

interface CoreProjectNew {
  id?: string // this is ignored by core (overidden)
  name: string
  description?: string
  is_public?: boolean
  organization_id?: string
  external_id: number // optional in API, but the whole point of this script is to set it
}

const { AUTHO_ANONYMOUS_CLIENT_SECRET, CORE_API_BASE_URL } = requireEnv('AUTHO_ANONYMOUS_CLIENT_SECRET', 'CORE_API_BASE_URL')

const HEADER_LOCATION_PREFIX = '/projects/'

const apiClient = ApiCoreClient.getInstance(AUTHO_ANONYMOUS_CLIENT_SECRET)
const createCoreProject = async (project: CoreProjectNew): Promise<[number, string]> => {
  const response = await apiClient.requestRaw({
    url: `${CORE_API_BASE_URL}/projects`,
    method: 'POST',
    headers: { source: 'arbimon' },
    data: project
  })

  const coreProjectId = response.headers.location.slice(HEADER_LOCATION_PREFIX.length)
  return [project.external_id, coreProjectId]
}

function isFulfilled<T> (item: PromiseSettledResult<T>): item is PromiseFulfilledResult<T> {
  return item.status === 'fulfilled'
}

const main = async (): Promise<void> => {
  try {
    const sequelize = getArbimonSequelize()

    // Get desynced projects from Arbimon
    const sqlGetDesynced = `
      SELECT name, description, is_private, project_id
      FROM projects p
      WHERE p.external_id IS NULL
      LIMIT 1
      ;
    `
    const desyncedProjects: ArbimonProject[] = await sequelize.query(sqlGetDesynced, { type: QueryTypes.SELECT, raw: true })

    // Exit if none
    if (desyncedProjects.length === 0) {
      console.info('No desynced projects')
      return
    }
    console.info(`Found ${desyncedProjects.length} desynced projects, including: ID ${desyncedProjects[0].project_id} (${desyncedProjects[0].name})`)

    // Call Core API
    const coreProjects: CoreProjectNew[] = desyncedProjects.map(ap => ({
      name: ap.name,
      description: ap.description,
      is_public: !ap.is_private,
      external_id: ap.project_id
    }))

    const projectIdPairResults = await Promise.allSettled(
      coreProjects.map(createCoreProject)
    )

    const projectIdPairs = projectIdPairResults
      .filter(isFulfilled)
      .map(res => res.value)

    // Log failures
    const arbimonIdsAll = coreProjects.map(cp => cp.external_id)
    const arbimonIdsSuccess = new Set(projectIdPairs.map(pair => pair[0]))
    const arbimonIdsFailure = arbimonIdsAll.filter(id => !arbimonIdsSuccess.has(id))

    if (arbimonIdsFailure.length > 0) {
      console.warn(`Failed to sync ${arbimonIdsFailure.length} projects: ${arbimonIdsFailure.join(', ')}`)
    }

    console.warn(`Successfully created ${projectIdPairs.length} projects in Core:\n${projectIdPairs.map(pair => `- ${pair[0]} -> ${pair[1]}`).join('\n')}`)

    // Save successes back to Arbimon
    for (const [idArbimon, idCore] of projectIdPairs) {
      console.info(`Saving ${idArbimon} -> ${idCore} in Arbimon`)
      const sqlUpdateExternalId = `
        UPDATE projects
        SET external_id = $idCore
        WHERE project_id = $idArbimon
        ;
      `
      const bind = { idArbimon, idCore }
      console.log({ sqlUpdateExternalId, bind })
      // TODO: Test this query:
      // await sequelize.query(sqlUpdateExternalId, { bind, type: QueryTypes.UPDATE, raw: true })
    }
  } catch (err) {
    console.error(err)
    process.exitCode = 1
  }
}

await main()
