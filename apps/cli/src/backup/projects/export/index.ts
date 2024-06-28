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

  if (verbose === true) {
    console.info(`Fetching ${item} in batches started`)
  }

  // Because recordings is a really big table,
  // we have to get all recordings slowly but surely by each site.
  if (item === 'recordings') {
    const allRecords = await fetchAllRecordsUsingSubquery<{ site_id: number }>(
      'sites',
      item,
      { projectId },
      (t) => ({ siteId: t.site_id }),
      sequelize,
      storage,
      legacyStorage,
      verbose
    )

    const zipFiles = await convertToCsv(item, allRecords)
    if (verbose === true) {
      console.info(`Fetched ${allRecords.length} records in ${zipFiles.length} file(s) for ${item}`)
    }

    return zipFiles
  }

  if (item === 'playlist_recordings') {
    const allRecords = await fetchAllRecordsUsingSubquery<{ playlist_id: number }>(
      'playlists',
      item,
      { projectId },
      (t) => ({ playlistId: t.playlist_id }),
      sequelize,
      storage,
      legacyStorage,
      verbose
    )

    const zipFiles = await convertToCsv(item, allRecords)
    if (verbose === true) {
      console.info(`Fetched ${allRecords.length} records in ${zipFiles.length} file(s) for ${item}`)
    }

    return zipFiles
  }

  if (item === 'pattern_matching_rois') {
    const allRecords = await fetchAllRecordsUsingSubquery<{ pattern_matching_id: number }>(
      'pattern_matchings',
      item,
      { projectId },
      (t) => ({ patternMatchingId: t.pattern_matching_id }),
      sequelize,
      storage,
      legacyStorage,
      verbose
    )

    const zipFiles = await convertToCsv(item, allRecords)
    if (verbose === true) {
      console.info(`Fetched ${allRecords.length} records in ${zipFiles.length} file(s) for ${item}`)
    }

    return zipFiles
  }

  const allRecords = await fetchAllRecords(
    item,
    query,
    sequelize,
    { projectId },
    storage,
    legacyStorage,
    signedUrls,
    verbose
  )

  const zipFiles = await convertToCsv(item, allRecords)
  if (verbose === true) {
    console.info(`Fetched ${allRecords.length} records in ${zipFiles.length} file(s) for ${item}`)
  }

  return zipFiles
}

/**
 * A function to get your final query results using a sub-query. Because if you were to do it directly,
 * we're not going to get the results because it's to expensive.
 *
 * @param item - The first item that you're getting.
 * @param finalItem - The final item that you're getting.
 * @param itemParams - The parameters you will use for the first query.
 * @params finalItemParamsGetter - The function that will take the first item's response
 * to get results for the `finalItem`.
 * @param sequelize - The database connection client.
 * @param storage - The storage client.
 * @param legacyStorage - The legacy storage client.
 * @param verbose - Verbose logging.
 *
 * @returns An array of objects of all the records inside the database from given SQL statement.
 * @throws Any database client errors.
 */
const fetchAllRecordsUsingSubquery = async <Res extends object>(
  item: string,
  finalItem: string,
  itemParams: Record<string, string | number>,
  finalItemParamsGetter: (t: Res) => Record<string, string | number>,
  sequelize: Sequelize,
  storage: StorageClient,
  legacyStorage: StorageClient,
  verbose: boolean | undefined
): Promise<object[]> => {
  const itemConfig = EXPORTS_MAPPER[item]
  const { sql: itemQuery, signedUrls: itemSignedUrl } = itemConfig

  const finalItemConfig = EXPORTS_MAPPER[finalItem]
  const { sql: finalItemQuery, signedUrls: finalItemSignedUrl } = finalItemConfig

  if (verbose === true) {
    console.info(`Started fetching for ${finalItem} by using results from ${item}.`)
  }

  const firstItems = await fetchAllRecords(
    item,
    itemQuery,
    sequelize,
    itemParams,
    storage,
    legacyStorage,
    itemSignedUrl,
    verbose
  )

  if (verbose === true) {
    console.info(`Successfully queried ${firstItems.length} ${item}. Starting query for ${finalItem}`)
  }

  const allFinalItems: object[] = []
  for (const firstItem of firstItems) {
    const firstItemParams = finalItemParamsGetter(firstItem as Res)

    if (verbose === true) {
      console.info(`Started querying for ${finalItem} using ${item} with params ${JSON.stringify(firstItemParams)}`)
    }

    const finalItems = await fetchAllRecords(
      finalItem,
      finalItemQuery,
      sequelize,
      firstItemParams,
      storage,
      legacyStorage,
      finalItemSignedUrl,
      verbose
    )

    allFinalItems.push(...finalItems)
  }

  if (verbose === true) {
    console.info(`Successfully queried all ${allFinalItems.length} ${finalItem}.`)
  }

  return allFinalItems
}

/**
 * A function to contiguously query for records inside the database until it cannot receive anything more from the database.
 *
 * @param item - The item that you're getting e.g. `recordings`
 * @param query - The query string.
 * @param sequelize - The database connection client.
 * @param params - Additional parameters that you're passing to the database client.
 * @param storage - The storage client.
 * @param legacyStorage - The legacy storage client.
 * @param signedUrls - Whether there are column called `path` inside the response and we need to convert them to s3 signed urls.
 * @param verbose - Verbose logging.
 *
 * @returns An array of objects of all the records inside the database from given SQL statement.
 * @throws Any database client errors.
 */
const fetchAllRecords = async (
  item: string,
  query: string,
  sequelize: Sequelize,
  params: Record<string, string | number>,
  storage: StorageClient,
  legacyStorage: StorageClient,
  signedUrls: boolean | undefined,
  verbose: boolean | undefined
): Promise<object[]> => {
  const responses = []
  let responseCount = 0
  let responseLength = 1
  let offset = 0

  try {
    if (verbose === true) {
      console.info(`Fetching ${item} with params ${JSON.stringify(params)} between ${offset} and ${offset + LIMIT_SIZE}`)
    }

    while (responseLength > 0) {
      const response = await retry(
        fetchData(query, sequelize, { limit: LIMIT_SIZE, offset, ...params })
      )
      const mappedResponse =
        signedUrls === true
          ? await mapPathToSignedUrl(
              response as Array<object & { path: string }>,
              storage,
              legacyStorage
            )
          : response

      responses.push(...mappedResponse)
      responseCount += response.length
      responseLength = response.length
      offset += LIMIT_SIZE
    }
  } catch (e) {
    console.error(
      `Error while fetching ${item} between ${offset} and ${offset + LIMIT_SIZE}. Aborting...`
    )
    console.error(e)
    throw e
  }

  if (verbose === true) {
    console.info(`Successfully fetched ${responseCount} ${item}`)
  }

  return responses
}

/**
 * Fetches the data by given `bind` parameters.
 *
 * @param sql - The SQL statement to fetch.
 * @param sequelize- The database connection client to fetch from.
 * @param bind - The bind parameters in the form of object with key as the name of the bind parameter.
 *   the parameter to bind corresponds to the `$param` you have written inside the `queries.ts` file.
 * @returns The results from the query.
 * @throws Any database error.
 */
const fetchData = async (
  sql: string,
  sequelize: Sequelize,
  bind: { limit: number, offset: number } & Record<string, string | number>
): Promise<object[]> => {
  return await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    bind,
    raw: true
  })
}

/**
 * Converts the data from object format into csv format.
 *
 * @param item - The name of the item to export, e.g. `recordings`.
 * @param responses - The array of objects that you wanted to convert to csv format.
 *
 * @returns The `ZipFile` object in an array containing the `name` of the zip file and their content, which is `string` in csv format.
 * @throws Any error that happened during the zip.
 */
const convertToCsv = async (item: string, responses: object[]): Promise<ZipFile[]> => {
  const files = chunk(responses, BATCH_SIZE)
  const zipFiles: ZipFile[] = []

  if (files.length <= 1) {
    const content = await toCsv(files[0] !== undefined ? files[0] : [], { dateNF: CSV_DATE_FORMAT })
    zipFiles.push({ name: `${item}.csv`, content })
  } else {
    for (let i = 0; i < files.length; i++) {
      const content = await toCsv(files[i], { dateNF: CSV_DATE_FORMAT })
      zipFiles.push({ name: `${item}_${String(i + 1).padStart(3, '0')}.csv`, content })
    }
  }

  return zipFiles
}
