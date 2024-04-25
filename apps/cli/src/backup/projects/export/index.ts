import type { S3Client } from '@aws-sdk/client-s3'
import type { Sequelize } from 'sequelize'

import { toCsv } from '@rfcx-bio/utils/file'

import { getSpecies } from '@/backup/projects/export/species'
import { getRecordings } from '@/export/project-csv/get-recordings'
import { getSites } from '@/export/project-csv/get-sites'
import { mapPathToSignedUrl } from '@/export/project-csv/map-path-to-signed-url'
import type { ZipFile } from '~/files'

export const EXPORTS_MAPPER = {
    sites: getSites,
    species: getSpecies,
    recordings: getRecordings
}

export const generateCsv = async (entity: string, projectId: number, sequelize: Sequelize, signedUrls: boolean = false, storage?: { client: S3Client, bucket: string }): Promise<ZipFile> => {
    const fetchData = EXPORTS_MAPPER[entity]
    const data = await fetchData(projectId, sequelize)
    if (signedUrls) {
        const { client, bucket } = storage
        const mappedData = await mapPathToSignedUrl(data, bucket, client)
        const csv = await toCsv(mappedData)
        return {
            name: entity,
            content: csv
        }
    }

    const csv = await toCsv(data)
    return {
        name: entity,
        content: csv
    }
}
