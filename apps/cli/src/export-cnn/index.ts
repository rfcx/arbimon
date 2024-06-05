import { createConsola } from 'consola'

import { getSequelize } from '@/db/connections'
import { ApiCoreClient } from '~/api-core/api-core-client'
import { requireEnv } from '~/env'
import { getMailClient } from '~/mail'
import { getStorageClient } from '~/storage'
import { exportDetections } from './detections'

const {
  CLASSIFIER_JOB_EXPORT_RECEIVER_EMAIL: userEmail,
  CLASSIFIER_JOB_EXPORT_ID: jobId,
  AUTHO_ANONYMOUS_CLIENT_SECRET: clientSecret,
  CLASSIFIER_JOB_EXPORT_TYPES: exportTypes
} = requireEnv(
  'CLASSIFIER_JOB_EXPORT_ID',
  'AUTHO_ANONYMOUS_CLIENT_SECRET',
  'CLASSIFIER_JOB_EXPORT_TYPES',
  'CLASSIFIER_JOB_EXPORT_RECEIVER_EMAIL'
)

const main = async (): Promise<void> => {
  const consola = createConsola({ fancy: false })
  consola.info('Arbimon export detections started on jobId:', jobId)
  consola.info('receiver email:', userEmail)
  consola.info('export types:', exportTypes)

  try {
    const apiClient = ApiCoreClient.getInstance(clientSecret)
    const storage = getStorageClient()
    const sequelize = getSequelize()
    const mailClient = getMailClient()

    await exportDetections(userEmail, jobId, exportTypes, apiClient, sequelize, storage, mailClient, consola)
  } catch (e) {
    consola.error(e)
    process.exitCode = 1
    consola.error('Arbimon export detections failed')
  }
}

await main()
