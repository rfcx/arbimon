import { chunk } from 'lodash-es'
import { type Sequelize, QueryTypes } from 'sequelize'

import type { StorageClient } from '@rfcx-bio/node-common/storage'
import { toCsv } from '@rfcx-bio/utils/file'

import { mapPathToSignedUrl } from '@/export/_common/map-path-to-signed-url'
import type { ZipFile } from '~/files'
import { retry } from '~/retry'
import { BATCH_SIZE, CSV_DATE_FORMAT, LIMIT_SIZE } from '../config'
import { PATTERN_MATCHING_ROIS, PATTERN_MATCHINGS, PLAYLIST_RECORDINGS, PLAYLISTS, RECORDING_VALIDATIONS, RECORDINGS, RFM_CLASSIFICATIONS, RFM_MODELS, SITES, SOUNDSCAPES, SPECIES, TEMPLATES } from './queries'

interface ExportConfig {
  sql: string
  signedUrls?: boolean
}

export const EXPORTS_MAPPER: Record<string, ExportConfig> = {
  sites: { sql: SITES },
  species: { sql: SPECIES },
  recordings: { sql: RECORDINGS, signedUrls: true },
  playlists: { sql: PLAYLISTS },
  playlist_recordings: { sql: PLAYLIST_RECORDINGS },
  templates: { sql: TEMPLATES, signedUrls: true },
  recording_validations: { sql: RECORDING_VALIDATIONS },
  pattern_matchings: { sql: PATTERN_MATCHINGS },
  pattern_matching_rois: { sql: PATTERN_MATCHING_ROIS },
  soundscapes: { sql: SOUNDSCAPES, signedUrls: true },
  rfm_models: { sql: RFM_MODELS },
  rfm_classifications: { sql: RFM_CLASSIFICATIONS }
}

export const generateCsvs = async (
  item: string,
  projectId: number,
  sequelize: Sequelize,
  storage: StorageClient,
  legacyStorage: StorageClient,
  verbose?: boolean
): Promise<ZipFile[]> => {
  // Get export config
  const config = EXPORTS_MAPPER[item]
  const { sql: query, signedUrls } = config

  const zipFiles: ZipFile[] = []

  let totalCount = 0
  let offset = 0

  if (verbose === true) {
    console.info(`Fetching ${item} in batches started`)
  }

  const responses: object[] = []
  let recordsLength = 1
  while (recordsLength > 0) {
    if (verbose === true) {
      console.info(`Fetching ${item} between ${offset} and ${offset + LIMIT_SIZE}`)
    }
    try {
      const records = await retry(
        fetchData(query, projectId, sequelize, { limit: LIMIT_SIZE, offset })
      )
      const mappedData =
        signedUrls === true
          ? await mapPathToSignedUrl(
              records as Array<object & { path: string }>,
              storage,
              legacyStorage
            )
          : records

      responses.push(...mappedData)
      recordsLength = records.length
      offset += LIMIT_SIZE
      totalCount += recordsLength
    } catch (e) {
      console.error(`Error while fetching ${item} between ${offset} and ${offset + LIMIT_SIZE}. Aborting...`)
      console.error(e)
      throw e
    }
  }

  const files = chunk(responses, BATCH_SIZE)

  if (files.length <= 1) {
    const content = await toCsv(files[0] !== undefined ? files[0] : [], { dateNF: CSV_DATE_FORMAT })
    zipFiles.push({ name: `${item}.csv`, content })
  } else {
    for (let i = 0; i < files.length; i++) {
      const content = await toCsv(files[i], { dateNF: CSV_DATE_FORMAT })
      zipFiles.push({ name: `${item}_${String(i + 1).padStart(3, '0')}.csv`, content })
    }
  }

  if (verbose === true) {
    console.info(`Fetched ${totalCount} records in ${zipFiles.length} file(s) for ${item}`)
  }

  return zipFiles
}

const fetchData = async (
  sql: string,
  projectId: number,
  sequelize: Sequelize,
  batch?: { limit?: number, offset?: number }
): Promise<object[]> => {
  const { limit, offset } = batch ?? {}

  let query = sql

  const bind: { projectId: number, limit?: number, offset?: number } = { projectId }

  if (limit !== undefined) {
    query += ' limit $limit'
    bind.limit = limit
  }

  if (offset !== undefined) {
    query += ' offset $offset'
    bind.offset = offset
  }

  return await sequelize.query(query, {
    type: QueryTypes.SELECT,
    bind,
    raw: true
  })
}
