import archiver from 'archiver'
import { type ConsolaInstance } from 'consola'
import { createWriteStream } from 'node:fs'
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

import { type ExportDetectionsType } from '@rfcx-bio/common/api-bio/cnn/export-detections'

import { CACHE_DIRECTORY } from '../constants'

export const saveFileTemporarily = async (filepath: string, content: string): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const writer = createWriteStream(filepath)
    writer.write(content)
    writer.end()

    writer.on('finish', () => { resolve() })
    writer.on('error', (e) => { reject(e) })
  })
}

export const getCacheFoldername = (projectId: string, jobId: number): string => {
  return `export-detections-${projectId}-${jobId}`
}

export const getZipFilepath = (projectId: string, jobId: number, filename: string): string => {
  return join(...CACHE_DIRECTORY, getCacheFoldername(projectId, jobId), filename)
}

/**
 * Returns the absolute file path to save detections. The file path is
 * `/tmp/rfcx/export-detections-${projectId}-${jobId}/${exportType}/${filename}`
 *
 * @param {string} projectId The project's id.
 * @param {number} jobId The classifier job's id.
 * @param {ExportDetectionsType} type The classifier export type, this creates a subfolder inside the zip file path.
 * @param {string | undefined} filename The file name, can be omitted and it will return the path without filename.
 *
 * @returns {string} the absolute path string of filename to cache inside `/tmp` folder.
 */
export const getCacheFilepath = (projectId: string, jobId: number, type: ExportDetectionsType, filename?: string): string => {
  if (filename === undefined) {
    return join(...CACHE_DIRECTORY, getCacheFoldername(projectId, jobId), type)
  }

  return join(...CACHE_DIRECTORY, getCacheFoldername(projectId, jobId), type, filename)
}

export const ensureEmptyCacheDirectory = async (folder: string, consola: ConsolaInstance): Promise<void> => {
  const log = consola.withTag('ensureEmptyCacheDirectory')

  await rm(folder, { recursive: true }).catch(e => {
    if (e.code === 'ENOENT') {
      log.warn('folder', folder, 'has not been existed from the start.')
    } else {
      throw e
    }
  })
  await mkdir(folder, { recursive: true })
}

export const createZipFile = async (
  projectId: string,
  jobId: number,
  filepath: string,
  exportTypes: ExportDetectionsType[],
  consola: ConsolaInstance
): Promise<void> => {
  const log = consola.withTag('createZipFile')

  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(filepath)
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })

    output.on('close', () => {
      resolve()
    })

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        log.warn(err)
      }
      reject(err)
    })

    archive.on('error', (err) => {
      reject(err)
    })

    for (const type of exportTypes) {
      const cacheFilePath = getCacheFilepath(projectId, jobId, type)
      archive.directory(cacheFilePath, type)
    }

    archive.pipe(output)
    archive.finalize().catch(reject)
  })
}
