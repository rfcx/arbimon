import type { S3Client } from '@aws-sdk/client-s3'
import type { Sequelize } from 'sequelize'

import { toCsv } from '@rfcx-bio/utils/file'

import {
    getPatternMatchingRois,
    getPatternMatchings,
    getPatternMatchingValidations
} from '@/backup/projects/export/pattern_matchings'
import { getPlaylistRecordings, getPlaylists } from '@/backup/projects/export/playlists'
import { getSoundscapes } from '@/backup/projects/export/soundscapes'
import { getSpecies } from '@/backup/projects/export/species'
import { getTemplates } from '@/backup/projects/export/templates'
import { getRecordingValidations } from '@/backup/projects/export/validations'
import { getRecordings } from '@/export/project-csv/get-recordings'
import { getSites } from '@/export/project-csv/get-sites'
import { mapPathToSignedUrl } from '@/export/project-csv/map-path-to-signed-url'
import { type ZipFile } from '~/files'

interface ExportConfig {
    getter: (projectId: number, sequelize: Sequelize) => Promise<any>
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
    soundscapes: { getter: getSoundscapes, signedUrls: true }
}

export const generateCsv = async (item: string, projectId: number, sequelize: Sequelize, storage?: { client: S3Client, bucket: string }): Promise<ZipFile> => {
    const name = item + '.csv'
    const config = EXPORTS_MAPPER[item]
    const { getter: fetchData, signedUrls } = config
    const data = await fetchData(projectId, sequelize)
    if (signedUrls === true) {
        const { client, bucket } = storage ?? {}
        if (client !== undefined && bucket !== undefined) {
            const mappedData = await mapPathToSignedUrl(data, bucket, client)
            const content = await toCsv(mappedData)
            return {
                name,
                content
            }
        }
    }

    const content = await toCsv(data)
    return {
        name,
        content
    }
}
