import fs from 'fs'
import { chunk } from 'lodash-es'
import { type Sequelize, QueryTypes } from 'sequelize'
import { pipeline, Readable, Transform } from 'stream'
import { promisify } from 'util'

import type { StorageClient } from '@rfcx-bio/node-common/storage'
import { toCsv } from '@rfcx-bio/utils/file'

import { mapPathToSignedUrl } from '@/export/_common/map-path-to-signed-url'
import { retry } from '~/retry'
import { BATCH_SIZE, CSV_DATE_FORMAT, LIMIT_SIZE, RECORDING_BATCH_SIZE } from '../config'
import { PATTERN_MATCHING_ROIS, PATTERN_MATCHINGS, PLAYLIST_RECORDINGS, PLAYLISTS, RECORDING_VALIDATIONS, RECORDINGS, RFM_CLASSIFICATIONS, RFM_MODELS, SITES, SOUNDSCAPES, SPECIES, TEMPLATES, RECORDING_TAGS } from './queries'

interface ExportConfig {
  sql: string
  signedUrls?: boolean
}

export const EXPORTS_MAPPER: Record<string, ExportConfig> = {
  sites: { sql: SITES },
  species: { sql: SPECIES },
  recordings: { sql: RECORDINGS, signedUrls: true },
  recordingTags: { sql: RECORDING_TAGS },
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
  minimum: boolean,
  sequelize: Sequelize,
  storage: StorageClient,
  legacyStorage: StorageClient,
  verbose?: boolean
): Promise<string[]> => {
  // Get export config
  const config = EXPORTS_MAPPER[item]
  const { sql: query, signedUrls } = config

  if (verbose === true) {
    console.info(`Fetching ${item} in batches started`)
  }

  // Because recordings is a really big table,
  // we have to get all recordings slowly but surely by each site.
  if (item === 'recordings') {
    const allRecords = fetchAllRecordsUsingSubquery<{ site_id: number }>(
      'sites',
      item,
      { projectId },
      (t) => ({ siteId: t.site_id }),
      sequelize,
      storage,
      legacyStorage,
      verbose
    )
    let totalRows = 1 // headers as first row
    let rowCount = 1 // headers as first row
    let fileCount = 1
    let fileName = `${item}.${String(fileCount).padStart(4, '0')}.csv`
    const allCSVFiles: string[] = []
    for await (const records of allRecords) {
      const recordChunked = chunk(records, RECORDING_BATCH_SIZE)
      for (const r of recordChunked) {
        if (r.at(0) === undefined) {
          continue
        }
        if (!allCSVFiles.includes(fileName)) {
          allCSVFiles.push(fileName)
        }
        await convertToCsv(fileName, r)
        rowCount += r.length - 1
        if (rowCount >= RECORDING_BATCH_SIZE) {
          fileCount++
          totalRows += rowCount
          rowCount = 1
          fileName = `${item}.${String(fileCount).padStart(4, '0')}.csv`
        }
      }
    }

    if (verbose === true) {
      console.info(`Fetched ${totalRows} records in ${fileCount} file(s) for ${item}`)
    }
    return allCSVFiles
  }

  if (item === 'recording_tags') {
    const allRecords = fetchAllRecordsUsingSubquery<{ site_id: number }>(
      'sites',
      item,
      { projectId },
      (t) => ({ siteId: t.site_id }),
      sequelize,
      storage,
      legacyStorage,
      verbose
    )
    let totalRows = 1 // headers as first row
    let rowCount = 1 // headers as first row
    let fileCount = 1
    let fileName = `${item}.${String(fileCount).padStart(4, '0')}.csv`
    const allCSVFiles: string[] = []
    for await (const records of allRecords) {
      if (records.at(0) === undefined) {
        continue
      }
      if (!allCSVFiles.includes(fileName)) {
        allCSVFiles.push(fileName)
      }
      await convertToCsv(fileName, records)
      rowCount += records.length - 1
      if (rowCount >= BATCH_SIZE) {
        fileCount++
        totalRows += rowCount
        rowCount = 1
        fileName = `${item}.${String(fileCount).padStart(4, '0')}.csv`
      }
    }

    if (verbose === true) {
      console.info(`Fetched ${totalRows} records in ${fileCount} file(s) for ${item}`)
    }
    return allCSVFiles
  }

  if (item === 'playlist_recordings') {
    const allRecords = fetchAllRecordsUsingSubquery<{ playlist_id: number }>(
      'playlists',
      item,
      { projectId },
      (t) => ({ playlistId: t.playlist_id }),
      sequelize,
      storage,
      legacyStorage,
      verbose
    )
    let totalRows = 1 // headers as first row
    let rowCount = 1 // headers as first row
    let fileCount = 1
    let fileName = `${item}.${String(fileCount).padStart(4, '0')}.csv`
    const allCSVFiles: string[] = []
    for await (const records of allRecords) {
      if (records.at(0) === undefined) {
        continue
      }
      if (!allCSVFiles.includes(fileName)) {
        allCSVFiles.push(fileName)
      }
      await convertToCsv(fileName, records)
      rowCount += records.length - 1
      if (rowCount >= BATCH_SIZE) {
        fileCount++
        totalRows += rowCount
        rowCount = 1
        fileName = `${item}.${String(fileCount).padStart(4, '0')}.csv`
      }
    }

    if (verbose === true) {
      console.info(`Fetched ${totalRows} records in ${fileCount} file(s) for ${item}`)
    }
    return allCSVFiles
  }

  if (item === 'pattern_matching_rois' && !minimum) {
    const allRecords = fetchAllRecordsUsingSubquery<{ pattern_matching_id: number }>(
      'pattern_matchings',
      item,
      { projectId },
      (t) => ({ patternMatchingId: t.pattern_matching_id }),
      sequelize,
      storage,
      legacyStorage,
      verbose
    )
    let totalRows = 1 // headers as first row
    let rowCount = 1 // headers as first row
    let fileCount = 1
    let fileName = `${item}.${String(fileCount).padStart(4, '0')}.csv`
    const allCSVFiles: string[] = []
    for await (const records of allRecords) {
      if (records.at(0) === undefined) {
        continue
      }
      if (!allCSVFiles.includes(fileName)) {
        allCSVFiles.push(fileName)
      }
      await convertToCsv(fileName, records)
      rowCount += records.length - 1
      if (rowCount >= BATCH_SIZE) {
        fileCount++
        totalRows += rowCount
        rowCount = 1
        fileName = `${item}.${String(fileCount).padStart(4, '0')}.csv`
      }
    }

    if (verbose === true) {
      console.info(`Fetched ${totalRows} records in ${fileCount} file(s) for ${item}`)
    }
    return allCSVFiles
  }

  if (!['recordings', 'playlist_recordings', 'pattern_matching_rois'].includes(item)) {
    const recordsGenerator = fetchAllRecords(
      item,
      query,
      sequelize,
      { projectId },
      storage,
      legacyStorage,
      signedUrls,
      verbose
    )

    let totalRows = 1 // headers as first row
    let rowCount = 1 // headers as first row
    let fileCount = 1
    let fileName = `${item}.${String(fileCount).padStart(4, '0')}.csv`
    const allCSVFiles: string[] = []
    for await (const records of recordsGenerator) {
      if (records.at(0) === undefined) {
        continue
      }
      if (!allCSVFiles.includes(fileName)) {
        allCSVFiles.push(fileName)
      }
      await convertToCsv(fileName, records)
      rowCount += records.length - 1
      if (rowCount >= BATCH_SIZE) {
        fileCount++
        totalRows += rowCount
        rowCount = 1
        fileName = `${item}.${String(fileCount).padStart(4, '0')}.csv`
      }
    }

    if (verbose === true) {
      console.info(`Fetched ${totalRows} records in ${fileCount} file(s) for ${item}`)
    }
    return allCSVFiles
  }
  return []
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
async function * fetchAllRecordsUsingSubquery <Res extends object> (
  item: string,
  finalItem: string,
  itemParams: Record<string, string | number>,
  finalItemParamsGetter: (t: Res) => Record<string, string | number>,
  sequelize: Sequelize,
  storage: StorageClient,
  legacyStorage: StorageClient,
  verbose: boolean | undefined
  ): AsyncGenerator<object[], void, unknown> {
    const itemConfig = EXPORTS_MAPPER[item]
    const { sql: itemQuery, signedUrls: itemSignedUrl } = itemConfig

    const finalItemConfig = EXPORTS_MAPPER[finalItem]
    const { sql: finalItemQuery, signedUrls: finalItemSignedUrl } = finalItemConfig

    if (verbose === true) {
      console.info(`Started fetching for ${finalItem} by using results from ${item}.`)
    }

    const firstItems: object[] = []
    const firstItemsGenerator = fetchAllRecords(
      item,
      itemQuery,
      sequelize,
      itemParams,
      storage,
      legacyStorage,
      itemSignedUrl,
      verbose
    )

    for await (const items of firstItemsGenerator) {
      for (const item of items) {
        firstItems.push(item)
      }
    }

    if (verbose === true) {
      console.info(`Successfully queried ${firstItems.length} ${item}. Starting query for ${finalItem}`)
    }

    const finalItems: object[] = []
    if (firstItems.length === 0) {
      yield []
    }
    for (const firstItem of firstItems) {
      const firstItemParams = finalItemParamsGetter(firstItem as Res)

      if (verbose === true) {
        console.info(`Started querying for ${finalItem} using ${item} with params ${JSON.stringify(firstItemParams)}`)
      }

      const finalItemsGenerator = fetchAllRecords(
        finalItem,
        finalItemQuery,
        sequelize,
        firstItemParams,
        storage,
        legacyStorage,
        finalItemSignedUrl,
        verbose
      )
      for await (const items of finalItemsGenerator) {
        yield items
      }
    }

    if (verbose === true) {
      console.info(`Successfully queried all ${finalItems.length} ${finalItem}.`)
    }
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
async function * fetchAllRecords (
  item: string,
  query: string,
  sequelize: Sequelize,
  params: Record<string, string | number>,
  storage: StorageClient,
  legacyStorage: StorageClient,
  signedUrls: boolean | undefined,
  verbose: boolean | undefined
): AsyncGenerator<object[], void, unknown> {
  let responseCount = 0
  let responseLength = LIMIT_SIZE
  let offset = 0

  try {
    if (verbose === true) {
      console.info(`Fetching ${item} with params ${JSON.stringify(params)} between ${offset} and ${offset + LIMIT_SIZE}`)
    }

    while (responseLength === LIMIT_SIZE) {
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

      yield mappedResponse
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
  // temporary fix due to `mysqld_stmt_execute`
  const stringBind = Object.fromEntries(
    Object.entries(bind).map(([key, value]) => [key, String(value)])
)
  return await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    bind: stringBind,
    raw: true
  })
}

/**
 * Converts the data from object format into csv format.
 *
 * @param filePath - The path of the csv file to export, e.g. `recordings_1.csv`.
 * @param responses - The array of objects that you wanted to convert to csv format.
 *
 * @returns The { updatedRowCount: number } object to know how many
 * @throws Any error that happened during the zip.
 */
const pipelineAsync = promisify(pipeline)
const convertToCsv = async (filePath: string, responses: object[]): Promise<void> => {
  const responseStream = Readable.from(responses)
  const csvTransform = new Transform({
    objectMode: true,
    async transform (chunk, encoding, callback) {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      const csvChunk = await toCsv(chunk ? [chunk] : [], { dateNF: CSV_DATE_FORMAT })
      callback(null, csvChunk.substring(csvChunk.indexOf('\n') + 1))
    }
  })

  let writeStream
  if (fs.existsSync(filePath)) {
    writeStream = fs.createWriteStream(filePath, { flags: 'a' })
  } else {
    // Write headers for the first chunk
    const csvHeader = (await toCsv(responses.at(0) ? [responses[0]] : [], { dateNF: CSV_DATE_FORMAT })).split('\n')[0] + '\n'
    writeStream = fs.createWriteStream(filePath, { flags: 'w' })
    writeStream.write(csvHeader)
  }

  try {
    await pipelineAsync(responseStream, csvTransform, writeStream)
  } catch (err) {
    console.error('Pipeline failed:', err)
  }
}
