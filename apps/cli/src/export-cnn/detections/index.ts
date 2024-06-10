import { type ConsolaInstance } from 'consola'
import dayjs from 'dayjs'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { type Sequelize, Op } from 'sequelize'

import { type ExportDetectionsType, EXPORT_DETECTIONS_TYPES } from '@rfcx-bio/common/api-bio/cnn/export-detections'
import { ModelRepository } from '@rfcx-bio/common/dao/model-repository'
import { type StorageClient } from '@rfcx-bio/common/storage'
import { chunkDates } from '@rfcx-bio/utils/dates'

import { type ApiCoreClient } from '~/api-core/api-core-client'
import { type MailClient } from '~/mail'
import { exportAllModelDetections } from '../all-model-detections'
import { DATE_CHUNKING_DURATION, DATE_FORMAT } from '../constants'
import { createZipFile, getZipFilepath } from '../export'
import { fetchClassifierJob } from './core-api'

export const exportDetections = async (
  email: string,
  jobId: string,
  exportTypes: string,
  client: ApiCoreClient,
  sequelize: Sequelize,
  storage: StorageClient,
  mail: MailClient,
  consola: ConsolaInstance
): Promise<void> => {
  const log = consola.withTag('exportDetections')
  const availableExportTypes: ExportDetectionsType[] = []

  const shasum = createHash('sha1')
  shasum.update(email)
  const emailHash = shasum.digest('hex')

  // get classifier job information
  const jobIdInt = Number(jobId)
  const job = await fetchClassifierJob(client, jobIdInt)

  // add 48 hours to start and end of job to ensure we will be able to retrieve all recordings from a job.
  const start = dayjs.utc(job.queryStart).subtract(48, 'hours')
  const end = dayjs.utc(job.queryEnd).add(48, 'hours')
  const dateRanges = chunkDates(start.format(DATE_FORMAT), end.format(DATE_FORMAT), DATE_CHUNKING_DURATION)

  if (exportTypes.includes(EXPORT_DETECTIONS_TYPES[0])) {
    log.info('Exporting all-model-detections category')
    await exportAllModelDetections(dateRanges, job.projectId, jobIdInt, client, log)
    availableExportTypes.push('all-model-detections')
  }

  if (exportTypes.includes(EXPORT_DETECTIONS_TYPES[1])) {
    log.info('Exporting results-per-day-recordings category')
    log.info('To be implemented')
  }

  if (exportTypes.includes(EXPORT_DETECTIONS_TYPES[2])) {
    log.info('Exporting species-detection-non-detection-matrix category')
    log.info('To be implemented')
  }

  // create zip file
  const zipFilename = `detections_export_${job.projectId}_${jobId}.zip`
  const zipFilePath = getZipFilepath(job.projectId, jobIdInt, zipFilename)

  log.info('Creating zip file at', zipFilePath)
  await createZipFile(job.projectId, jobIdInt, zipFilePath, availableExportTypes, log)

  // upload to s3
  const loadedZipFile = await readFile(zipFilePath)
  // make zip filepath contains email hash to identify whom it comes from
  const key = `classifier-job-exports/${jobIdInt}-${emailHash.substring(0, 8)}/${zipFilename}`

  log.info('Uploading zip file to S3 with key', key)
  await storage.putObject(key, loadedZipFile, { ContentType: 'application/zip' })
  const url = await storage.getObjectSignedUrl(key)

  // notify in email
  log.info('Sending the detections to email', email)

  const { UserProfile } = ModelRepository.getInstance(sequelize)
  const user = await UserProfile.findOne({
    where: {
      email: {
        [Op.iLike]: email
      }
    }
  })

  const to = {
    email,
    name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
  }
  const content = { url, jobId: jobIdInt }
  await mail.send(to, 'export-detections', content)
  log.info('Email sent to', email)
}
