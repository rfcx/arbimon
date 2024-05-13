import { type Sequelize } from 'sequelize'

import { type StorageClient } from '@rfcx-bio/common/storage'
import { toCsv } from '@rfcx-bio/utils/file'

import { getClassifications } from '@/backup/projects/export/classifications'
import { getPatternMatchingRois, getPatternMatchings, getPatternMatchingValidations } from '@/backup/projects/export/pattern_matchings'
import { getPlaylistRecordings, getPlaylists } from '@/backup/projects/export/playlists'
import { getRecordings } from '@/backup/projects/export/recordings'
import { getSites } from '@/backup/projects/export/sites'
import { getSoundscapes } from '@/backup/projects/export/soundscapes'
import { getSpecies } from '@/backup/projects/export/species'
import { getTemplates } from '@/backup/projects/export/templates'
import { getRecordingValidations } from '@/backup/projects/export/validations'
import { mapPathToSignedUrl } from '@/export/_common/map-path-to-signed-url'
import { type ZipFile } from '~/files'

const BATCH_SIZE = 200000

interface ExportConfig {
    getter: (projectId: number, sequelize: Sequelize, batch?: { limit?: number, offset?: number }) => Promise<object[]>
    signedUrls?: boolean
}

export const EXPORTS_MAPPER: Record<string, ExportConfig> = {
    sites: { getter: getSites },
    species: { getter: getSpecies },
    recordings: { getter: getRecordings, signedUrls: true },
    playlists: { getter: getPlaylists },
    playlist_recordings: { getter: getPlaylistRecordings },
    templates: { getter: getTemplates, signedUrls: true },
    recording_validations: { getter: getRecordingValidations },
    pattern_matchings: { getter: getPatternMatchings },
    pattern_matching_rois: { getter: getPatternMatchingRois, signedUrls: true },
    pattern_matching_validations: { getter: getPatternMatchingValidations },
    soundscapes: { getter: getSoundscapes, signedUrls: true },
    classifications: { getter: getClassifications }
}

export const generateCsvs = async (item: string, projectId: number, sequelize: Sequelize, storage: StorageClient, legacyStorage: StorageClient, verbose?: boolean): Promise<ZipFile[]> => {
    // Get export config
    const config = EXPORTS_MAPPER[item]
    const { getter: fetchData, signedUrls } = config

    const zipFiles: ZipFile[] = []

    let batchRecords = BATCH_SIZE
    let currentBatch = 0
    let totalCount = 0
    let offset = 0

    if (verbose === true) {
        console.info(`Fetching ${item} in batches started`)
    }
    while (batchRecords === BATCH_SIZE) {
        try {
            currentBatch += 1
            if (verbose === true) {
                console.info(`Fetching batch #${currentBatch} between ${offset} and ${offset + BATCH_SIZE}`)
            }

            const records = await fetchData(projectId, sequelize, { limit: BATCH_SIZE, offset })
            const mappedData = signedUrls === true ? await mapPathToSignedUrl(records as Array<object & { path: string }>, storage, legacyStorage) : records
            const content = await toCsv(mappedData)

            zipFiles.push({ name: `${item}_${currentBatch}.csv`, content })
            batchRecords = records?.length
            totalCount += batchRecords

            if (verbose === true) {
                console.info(`Fetched ${batchRecords} records between ${offset} and ${offset + BATCH_SIZE}`)
            }
        } catch (e) {
            console.info(`Error fetching batch #${currentBatch} between ${offset} and ${offset + BATCH_SIZE}`, e)
        } finally {
            offset += BATCH_SIZE
        }
    }

    if (verbose === true) {
        console.info(`Fetched ${totalCount} records in ${zipFiles.length} file(s) for ${item}`)
    }

    // Only one batch of data was found
    if (zipFiles.length === 1) {
        return [{ name: `${item}.csv`, content: zipFiles[0].content }]
    } else {
        return zipFiles
    }
}
