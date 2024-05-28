import { type ConsolaInstance } from 'consola'
import { chunk } from 'lodash-es'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import { toCsv } from '@rfcx-bio/utils/file'

import { type ApiCoreClient } from '~/api-core/api-core-client'
import { CACHE_DIRECTORY, CSV_ROW_LIMIT } from '../constants'
import { type Detection, getDetections } from '../detections/core-api'
import { ensureEmptyCacheDirectory, getCacheFilepath, getCacheFoldername, saveFileTemporarily } from '../export'

const getFilename = (index: number): string => {
  return `detections_${index.toString().padStart(3, '0')}.csv`
}

export const exportAllModelDetections = async (
  dateRanges: Array<{ start: string, end: string }>,
  projectId: string,
  jobId: number,
  client: ApiCoreClient,
  consola: ConsolaInstance
): Promise<void> => {
  const log = consola.withTag('exportAllModelDetections')
  let totalCount = 0
  const filePaths: string[] = []
  const tempDetections: Detection[] = []
  let fileIndex = 1

  log.info('Ensuring the cache directory is empty')
  await ensureEmptyCacheDirectory(join(...CACHE_DIRECTORY), log)

  const cacheDestination = join(...CACHE_DIRECTORY, getCacheFoldername(projectId, jobId), 'all-model-detections')
  log.info('Creating new cache destination at', cacheDestination)
  await mkdir(cacheDestination, { recursive: true })

  log.info('Start querying all detections')
  for (const { start, end } of dateRanges) {
    log.info('Getting all detections between', start, 'and', end)
    const detections = await getDetections(
      client,
      jobId,
      start,
      end,
      log
    )

    totalCount += detections.length
    tempDetections.push(...detections)
    if (tempDetections.length > CSV_ROW_LIMIT) {
      log.info('tempDetections length is longer than row limit, exporting the detections to file')
      const chunks = chunk(tempDetections, CSV_ROW_LIMIT)

      // Save all file chunks except the last one that has not yet reached the file limit.
      for (let i = 0; i < chunks.length - 1; i++) {
        const filename = getFilename(fileIndex)
        const fullPath = getCacheFilepath(projectId, jobId, 'all-model-detections', filename)

        log.info('saving file at', fullPath)
        const csv = await toCsv(chunks[i])
        await saveFileTemporarily(fullPath, csv)
        filePaths.push(fullPath)
        fileIndex += 1
      }

      // Clear the temp detections endpoint and push the remaining detections to the array.
      log.info('Clearing the temp detections array and putting the last chunks inside for next export')
      tempDetections.length = 0
      tempDetections.push(...chunks[chunks.length - 1])
    } else {
      log.info('Skipping file save since detections have not reached the threshold')
    }
  }

  const lastFilename = getFilename(fileIndex)
  const lastFileFullPath = getCacheFilepath(projectId, jobId, 'all-model-detections', lastFilename)

  log.info('Saving last file of the export', lastFileFullPath)
  const csv = await toCsv(tempDetections)
  await saveFileTemporarily(lastFileFullPath, csv)
  filePaths.push(lastFileFullPath)

  log.info('Successfully saved', totalCount, 'detections inside', fileIndex - 1, 'files')
}
