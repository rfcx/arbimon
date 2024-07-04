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
import { getProjectFromSlug } from './location-project'
import { getUserFromEmail } from './user-profile'

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

export interface RequiredProjectInformation {
  projectId: number
  slug: string
  arbimonProjectId: number
  projectName: string
  userEmail: string
  userName: string
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

  const projectSlug = process.argv[2]
  if (!projectSlug) {
    throw Error('Missing project slug')
  }
  console.info('Receive Project slug: ', projectSlug)
  const email = process.argv[3]
  if (!email) {
    throw Error('Missing user email')
  }
  console.info('Receive email: ', email)

  console.info('Fetching project: ', projectSlug)
  const project = await getProjectFromSlug(sequelize, projectSlug)
  if (!project) {
    throw Error('Project not found')
  }
  console.info('Fetching email: ', email)
  const user = await getUserFromEmail(sequelize, email)
  if (!user) {
    throw Error('User not found')
  }

  const requiredData: RequiredProjectInformation = {
    projectId: project.id,
    slug: project.slug,
    projectName: project.name,
    arbimonProjectId: project.idArbimon,
    userEmail: user.email,
    userName: `${user.firstName} ${user.lastName}`
  }

  const { userEmail, userName, ...projectData } = requiredData

  try {
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

    const url = await storage.getObjectSignedUrl(key)

    // Send email to user
    const to = { email: userEmail, name: userName }
    const content = { url, projectName: projectData.projectName }
    await mailClient.send(to, 'project-backup', content)
    if (verbose) {
      console.info(`  - Mail sent to ${to.email}`)
    }

    successCount++
  } catch (e) {
    console.error(`Error processing backup with ${project.name}`, e)
    console.error(`Sending backup error email to ${userEmail} with bcc to 'support@rfcx.org'`)

    await mailClient.send(
      { email: userEmail, name: userName },
      'project-backup-failed',
      { projectName: projectData.projectName },
      'support@rfcx.org'
    )
    console.error(`Successfully sent error email to ${userEmail}`)
  }

  if (verbose) {
    console.info(`Processed backup requests successfully`)
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
