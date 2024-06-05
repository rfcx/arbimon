import { type Sequelize, QueryTypes } from 'sequelize'

import { type StorageClient } from '@rfcx-bio/node-common/storage'
import { toCsv } from '@rfcx-bio/utils/file'

import { mapPathToSignedUrl } from '@/export/_common/map-path-to-signed-url'
import { type ZipFile } from '~/files'
import { PATTERN_MATCHING_ROIS, PATTERN_MATCHINGS, PLAYLIST_RECORDINGS, PLAYLISTS, RECORDING_VALIDATIONS, RECORDINGS, RFM_CLASSIFICATIONS, RFM_MODELS, SITES, SOUNDSCAPES, SPECIES, TEMPLATES } from './queries'

const BATCH_SIZE = 200000

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

export const generateCsvs = async (item: string, projectId: number, sequelize: Sequelize, storage: StorageClient, legacyStorage: StorageClient, verbose?: boolean): Promise<ZipFile[]> => {
    // Get export config
    const config = EXPORTS_MAPPER[item]
    const { sql: query, signedUrls } = config

    const zipFiles: ZipFile[] = []

    let batchRecords = BATCH_SIZE
    let currentBatch = 0
    let totalCount = 0
    let offset = 0

    if (verbose === true) {
        console.info(`Fetching ${item} in batches started`)
    }
    while (batchRecords === BATCH_SIZE) {
        currentBatch += 1
        const batchNumber = String(currentBatch).padStart(3, '0')
        if (verbose === true) {
            console.info(`Fetching batch #${batchNumber} between ${offset} and ${offset + BATCH_SIZE}`)
        }
        try {
            const records = await fetchData(query, projectId, sequelize, { limit: BATCH_SIZE, offset })
            const mappedData = signedUrls === true ? await mapPathToSignedUrl(records as Array<object & { path: string }>, storage, legacyStorage) : records
            const content = await toCsv(mappedData, { dateNF: 'm/d/yy hh:mm:ss' })

            zipFiles.push({ name: `${item}_${batchNumber}.csv`, content })
            batchRecords = records?.length
            totalCount += batchRecords

            if (verbose === true) {
                console.info(`Fetched ${batchRecords} records between ${offset} and ${offset + BATCH_SIZE}`)
            }
        } catch (e) {
            batchRecords = 0
            console.info(`Error fetching batch #${batchNumber} between ${offset} and ${offset + BATCH_SIZE}`, e)
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

const fetchData = async (sql: string, projectId: number, sequelize: Sequelize, batch?: { limit?: number, offset?: number }): Promise<object[]> => {
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
