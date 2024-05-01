import { type S3Client } from '@aws-sdk/client-s3'
import { readFile, stat, unlink } from 'fs/promises'
import { type Sequelize } from 'sequelize'

import { BackupStatus } from '@rfcx-bio/common/dao/types/backup'
import type { StorageClient } from '@rfcx-bio/common/storage'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { VERBOSE } from '@/backup/projects/config'
import { generateCsv } from '@/backup/projects/export'
import { type ProjectBackupRequest, getPendingRequests, updateRequest } from '@/backup/projects/requests'
import { generateSignedUrl } from '@/export/project-csv/generate-signed-url'
import { type ZipFile, createZip } from '~/files'
import { type MailClient } from '~/mail'

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
export const backupProjects = async (sequelize: Sequelize, arbimonSequelize: Sequelize, storage: StorageClient, mailClient: MailClient, verbose: boolean = VERBOSE): Promise<any> => {
    let successCount = 0

    // Fetch pending backup requests
    const requests = await getPendingRequests(sequelize)

    if (verbose) {
        console.info(`Found ${requests.length} project backup request(s)`)
    }

    for (const request of requests) {
        const { id, userEmail, userName, ...projectData } = request
        if (verbose) {
            console.info(`- Backup ${id} started for ${projectData.slug}`)
        }
        try {
            // Change status to processing
            await updateRequest(sequelize, id, { status: BackupStatus.PROCESSING })

            // Create export zip
            const { zipName, totalBytes } = await createExport(sequelize, arbimonSequelize, storage, projectData)
            if (verbose) {
                console.info(`  - Created ${zipName}, total ${totalBytes} bytes`)
            }

            // Upload to S3
            const file = await readFile('./' + zipName)
            const key = `exports/${projectData.projectId}/${zipName}`
            const expiresAt = dayjs().add(7, 'day').toDate()
            await storage.putObject(key, file)
            const url = await generateSignedUrl(storage.getClient(), storage.getBucket(), key)
            const size = (await stat('./' + zipName)).size // bytes
            await unlink('./' + zipName)
            if (verbose) {
                console.info(`  - Uploaded to ${key}, total ${size} bytes`)
            }

            // Update status, expiresAt, size, url
            await updateRequest(sequelize, id, { status: BackupStatus.AVAILABLE, expiresAt, size, url })

            // Send email to user
            const to = { email: userEmail, name: userName }
            const content = { url, projectName: projectData.projectName }
            await mailClient.send(to, 'project-backup', content)
            if (verbose) {
                console.info(`  - Mail sent to ${to.email}`)
            }

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

const createExport = async (sequelize: Sequelize, arbimonSequelize: Sequelize, storage: StorageClient, projectData: Omit<ProjectBackupRequest, 'id' | 'userEmail' | 'userName' >): Promise<{ zipName: string, totalBytes: number }> => {
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
            console.error(`Error exporting ${item}: `, e)
        }
    }

    // Export data from arbimon database
    for (const item of EXPORT_ITEMS.ARBIMON) {
        try {
            const file = await generateCsv(item, arbimonProjectId, arbimonSequelize, { client, bucket })
            zipFiles.push(file)
        } catch (e) {
            console.error(`Error exporting ${item}: `, e)
        }
    }

    // Create zip with csv files
    // TODO: create file in temporary folder and return filename and path
    const formattedDate = dayjs().format('YYYY-MM-DD')
    const zipName = `${slug}_${formattedDate}_export.zip`
    const { totalBytes } = await createZip(zipName, zipFiles)
    return { zipName, totalBytes }
}
