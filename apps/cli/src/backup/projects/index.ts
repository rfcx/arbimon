import { type S3Client } from '@aws-sdk/client-s3'
import fs from 'fs'
import {
    type Sequelize
} from 'sequelize'

import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type Backup, BackupStatus } from '@rfcx-bio/common/dao/types/backup'
import type { StorageClient } from '@rfcx-bio/common/storage'

import {
    BATCH_LIMIT,
    VERBOSE
} from '@/backup/projects/config'
import { generateCsv } from '@/backup/projects/export'
import { generateSignedUrl } from '@/export/project-csv/generate-signed-url'
import { getArbimonSequelize } from '@/ingest/_connections/arbimon'
import { type ZipFile, createZip } from '~/files'

/**
 * Processes backup requests and creates backup for projects
 *
 * @param sequelize
 * @param storage
 * @param verbose
 */
export const backupProjects = async (sequelize: Sequelize, storage: StorageClient, verbose: boolean = VERBOSE): Promise<any> => {
    const arbimonSequelize = getArbimonSequelize()
    let offset = 0
    let responseCount = 1
    let totalCount = 0
    const processedCount = 0
    const requests = []
    // const request: ProjectBackupRequest = {
    //     id: 123,
    //     projectId: 1209,
    //     arbimonProjectId: 1209,
    //     slug: 'test-slug',
    //     email: 'test'
    // }

    // Fetch pending backup requests
    while (responseCount !== 0) {
        try {
            const response = await getPendingRequests(sequelize, offset)
            responseCount = response?.length
            totalCount += responseCount
            requests.push(...response)
        } catch (e) {
            if (verbose) {
                console.info(`Error fetching batch with offset ${offset} and batch size ${BATCH_LIMIT}: `, e)
            }
        } finally {
            offset += BATCH_LIMIT
        }
    }

    if (verbose) {
        console.info(`Found ${totalCount} project backup requests`)
    }

    for (const request of requests) {
        const { id, projectId, arbimonProjectId, slug, email } = request
        try {
            // Change status to processing
            await updateRequest(sequelize, id, { status: BackupStatus.PROCESSING })

            const zipFiles: ZipFile[] = []
            const client: S3Client = storage.getClient()
            const bucket = storage.getBucket()

            // Create csv files
            console.info('STEP: Get sites')
            const sites = await generateCsv('sites', arbimonProjectId, arbimonSequelize)
            zipFiles.push(sites)

            console.info('STEP: Get species')
            const species = await generateCsv('species', projectId, sequelize)
            zipFiles.push(species)

            console.info('STEP: Get recordings')
            const recordings = await generateCsv('recordings', arbimonProjectId, arbimonSequelize, true, { client, bucket })
            zipFiles.push(recordings)

            console.info('STEP: Get playlists')
            const playlists = await generateCsv('playlists', arbimonProjectId, arbimonSequelize)
            zipFiles.push(playlists)

            console.info('STEP: Get playlist recordings')
            // TODO

            // Create zip with csv files
            const now = new Date()
            const formattedDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
            const zipName = `${slug}_${formattedDate}_export.zip`
            createZip(zipName, zipFiles)

            const file = fs.readFileSync('./' + zipName)
            const key = `exports/${projectId}/${formattedDate}/${zipName}`
            const expiresAt = new Date()
            expiresAt.setDate(now.getDate() + 7) // in 7 days

            //  Upload to export folder in S3
            await storage.putObject(key, file)

            // Update status, expiresAt, size, url
            const url = await generateSignedUrl(client, bucket, key)
            const size = (await fs.promises.stat(zipName)).size / (1024 * 1024) // in MB
            await updateRequest(sequelize, id, { status: BackupStatus.AVAILABLE, expiresAt, size, url })

            // TODO - send email to user
        } catch (e) {
            if (verbose) {
                console.info(`Error processing backup request with id ${id} for projectId ${projectId}`, e)
            }
        }
    }

    if (verbose) {
        console.info(`Project backup end - processed ${processedCount} backup requests in total.`)
    }
}

const getPendingRequests = async (sequelize: Sequelize, offset: number, limit: number = BATCH_LIMIT): Promise<ProjectBackupRequest[]> => {
    const sql = `
        select
            backup.id as id,
            location_project.id as projectId,
            location_project.slug as slug,
            location_project.id_arbimon as arbimonProjectId,
            user_profile.email as email
        from
            backup join location_project on backup.entity_id = location_project.id
            left join user_profile on backup.requested_by = user_profile.id
        where backup.status = 'requested'
        limit :limit
        offset :offset
        // order by? requested_at
    `

    return await sequelize.query<ProjectBackupRequest>(sql, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: {
            limit,
            offset
        }
    })
}

const updateRequest = async (sequelize: Sequelize, id: number, updates: Partial<Backup>): Promise<void> => {
    const { Backup } = ModelRepository.getInstance(sequelize)
    const request = await Backup.findOne({
        where: {
            id
        }
    })

    if (request !== null) {
        await request.update(updates)
    }
}

interface ProjectBackupRequest {
    id: number
    projectId: number
    slug: string
    arbimonProjectId: number
    email: string
}
