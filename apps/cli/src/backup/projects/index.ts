import { type S3Client } from '@aws-sdk/client-s3'
import fs from 'fs'
import { type Sequelize } from 'sequelize'

import { BackupStatus } from '@rfcx-bio/common/dao/types/backup'
import type { StorageClient } from '@rfcx-bio/common/storage'

import { VERBOSE } from '@/backup/projects/config'
import { generateCsv } from '@/backup/projects/export'
import { type ProjectBackupRequest, getPendingRequests, updateRequest } from '@/backup/projects/requests'
import { generateSignedUrl } from '@/export/project-csv/generate-signed-url'
import { type ZipFile, createZip } from '~/files'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

const EXPORT_ITEMS = {
    BIO: ['species'],
    ARBIMON: ['sites', 'recordings', 'playlists', 'playlist_recordings', 'templates', 'recording_validations', 'pattern_matchings', 'pattern_matching_rois', 'pattern_matching_validations', 'soundscapes']
}

/**
 * Processes backup requests and creates backup for projects
 *
 * @param sequelize
 * @param storage
 * @param verbose
 */
export const backupProjects = async (sequelize: Sequelize, arbimonSequelize: Sequelize, storage: StorageClient, verbose: boolean = VERBOSE): Promise<any> => {
    let successCount = 0

    // Fetch pending backup requests
    const requests = await getPendingRequests(sequelize)

    if (verbose) {
        console.info(`Found ${requests.length} project backup request(s)`)
    }

    for (const request of requests) {
        const { id, email, ...projectData } = request
        try {
            // Change status to processing
            await updateRequest(sequelize, id, { status: BackupStatus.PROCESSING })

            // Create export zip
            const zipName = await createExport(sequelize, arbimonSequelize, storage, projectData)

            // Read file and upload to S3
            const file = fs.readFileSync('./' + zipName)
            const key = `exports/${projectData.projectId}/${zipName}`
            const expiresAt = dayjs().add(7, 'day').toDate()

            // Upload to export folder in S3
            await storage.putObject(key, file)

            // Update status, expiresAt, size, url
            const url = await generateSignedUrl(storage.getClient(), storage.getBucket(), key)
            const size = (await fs.promises.stat('./' + zipName)).size // bytes
            await updateRequest(sequelize, id, { status: BackupStatus.AVAILABLE, expiresAt, size, url })

            // TODO - send email to user
            successCount++
        } catch (e) {
            if (verbose) {
                console.info(`Error processing backup request with id ${id}`, e)
            }
        }
    }

    if (verbose) {
        console.info(`Processed ${successCount}/${requests.length} backup requests successfully`)
    }
}

const createExport = async (sequelize: Sequelize, arbimonSequelize: Sequelize, storage: StorageClient, projectData: Omit<ProjectBackupRequest, 'id' | 'email' >): Promise<string> => {
    const { projectId, arbimonProjectId, slug } = projectData
    const zipFiles: ZipFile[] = []
    const client: S3Client = storage.getClient()
    const bucket = storage.getBucket()

    // Create csv files
    // Export data from bio database
    for (const item of EXPORT_ITEMS.BIO) {
        try {
            const file = await generateCsv(item, projectId, sequelize, { client, bucket })
            zipFiles.push(file)
        } catch (e) {
            console.info(`Error exporting ${item}: `, e)
        }
    }

    // Export data from arbimon database
    for (const item of EXPORT_ITEMS.ARBIMON) {
        try {
            const file = await generateCsv(item, arbimonProjectId, arbimonSequelize, { client, bucket })
            zipFiles.push(file)
        } catch (e) {
            console.info(`Error exporting ${item}: `, e)
        }
    }

    // Create zip with csv files
    const formattedDate = dayjs().format('YYYY-MM-DD')
    const zipName = `${slug}_${formattedDate}_export.zip`
    await createZip(zipName, zipFiles)
    return zipName
}
