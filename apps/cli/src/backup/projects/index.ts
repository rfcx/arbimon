import { readFile, unlink } from 'node:fs/promises'
import type { Sequelize } from 'sequelize'

import { BackupStatus } from '@rfcx-bio/node-common/dao/types/backup'
import type { StorageClient } from '@rfcx-bio/node-common/storage'
import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'

import { VERBOSE } from '@/backup/projects/config'
import { generateCsvs } from '@/backup/projects/export'
import { type ProjectBackupRequest, getPendingRequests, updateRequest } from '@/backup/projects/requests'
import { createZip } from '~/files'
import type { MailClient } from '~/mail'

export const EXPORT_ITEMS = {
  BIO: [] as string[],
  ARBIMON: [
    'sites',
    'recordings',
    'playlists',
    'playlist_recordings',
    'species',
    'templates',
    'recording_validations',
    'pattern_matchings',
    'pattern_matching_rois',
    'soundscapes',
    'rfm_models',
    'rfm_classifications'
  ]
}

/**
 * Processes backup requests and creates backup for projects
 *
 * @param sequelize
 * @param arbimonSequelize
 * @param storage
 * @param legacyStorage
 * @param mailClient
 * @param verbose
 */
export const backupProjects = async (
  sequelize: Sequelize,
  arbimonSequelize: Sequelize,
  storage: StorageClient,
  legacyStorage: StorageClient,
  mailClient: MailClient,
  verbose: boolean = VERBOSE
): Promise<void> => {
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
      const { zipName, totalBytes } = await createExport(
        sequelize,
        arbimonSequelize,
        storage,
        legacyStorage,
        projectData,
        verbose
      )
      if (verbose) {
        console.info(`  - Created ${zipName}, total ${totalBytes} bytes`)
      }

      // Upload to S3
      const file = await readFile(`./${zipName}`)
      const key = `exports/${projectData.projectId}/${zipName}`
      await storage.putObject(key, file)
      await unlink(`./${zipName}`)
      if (verbose) {
        console.info(`  - Uploaded to ${key}`)
      }

      // Update url and change status to available
      const expiresAt = dayjs().add(7, 'day').toDate()
      const url = await storage.getObjectSignedUrl(key)
      await updateRequest(sequelize, id, {
        status: BackupStatus.AVAILABLE,
        expiresAt,
        size: totalBytes,
        url
      })

      // Send email to user
      const to = { email: userEmail, name: userName }
      const content = { url, projectName: projectData.projectName }
      await mailClient.send(to, 'project-backup', content)
      if (verbose) {
        console.info(`  - Mail sent to ${to.email}`)
      }

      successCount++
    } catch (e) {
      await updateRequest(sequelize, id, {
        status: BackupStatus.ERROR
      })
      console.error(`Error processing backup with id ${id}`, e)
      console.error(`Sending backup error email to ${userEmail} with bcc to 'support@rfcx.org'`)

      await mailClient.send(
        { email: userEmail, name: userName },
        'project-backup-failed',
        { projectName: projectData.projectName },
        'support@rfcx.org'
      )

      console.error(`Successfully sent error email to ${userEmail}`)
    }
  }

  if (verbose) {
    console.info(`Processed ${successCount}/${requests.length} backup requests successfully`)
  }
}

const createExport = async (
  sequelize: Sequelize,
  arbimonSequelize: Sequelize,
  storage: StorageClient,
  legacyStorage: StorageClient,
  projectData: Omit<ProjectBackupRequest, 'id' | 'userEmail' | 'userName'>,
  verbose?: boolean
): Promise<{ zipName: string, totalBytes: number }> => {
  const { projectId, arbimonProjectId, slug, minimum } = projectData
  const allFilePaths: string[] = []

  // Create csv files
  // Export data from bio database
  for (const item of EXPORT_ITEMS.BIO) {
    const filePaths = await generateCsvs(item, projectId, minimum, sequelize, storage, legacyStorage, verbose)
    allFilePaths.push(...filePaths)
  }

  // Export data from arbimon database
  for (const item of EXPORT_ITEMS.ARBIMON) {
    const filePaths = await generateCsvs(
      item,
      arbimonProjectId,
      minimum,
      arbimonSequelize,
      storage,
      legacyStorage,
      verbose
    )
    allFilePaths.push(...filePaths)
  }

  // Create zip with csv files
  // TODO: create file in temporary folder and return filename and path
  const formattedDate = dayjs().format('YYYY-MM-DD')
  const zipName = `${slug}_${formattedDate}_export.zip`
  const { totalBytes } = await createZip(zipName, allFilePaths)
  // Remove csv files after zipped
  for (const localPath of allFilePaths) {
    await unlink(`./${localPath}`)
  }
  return { zipName, totalBytes }
}
