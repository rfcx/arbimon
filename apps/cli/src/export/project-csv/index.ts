import { S3Client } from '@aws-sdk/client-s3'

import { toCsv } from '@rfcx-bio/utils/file'

import { getArbimonSequelize } from '@/ingest/_connections/arbimon'
import { requireEnv } from '~/env'
import { getRecordings } from './get-recordings'
import { getSites } from './get-sites'
import { mapPathToSignedUrl } from './map-path-to-signed-url'

const main = async (): Promise<void> => {
  console.info('Export Project CSV start')

  const {
    ARBIMON_PROJECT_ID: projectId,
    AWS_S3_BUCKET_REGION: region,
    AWS_S3_ACCESS_KEY_ID: accessKeyId,
    AWS_S3_SECRET_ACCESS_KEY: secretAccessKey,
    AWS_S3_BUCKET_NAME: bucket
  } = requireEnv('ARBIMON_PROJECT_ID', 'AWS_S3_BUCKET_REGION', 'AWS_S3_SECRET_ACCESS_KEY', 'AWS_S3_ACCESS_KEY_ID', 'AWS_S3_BUCKET_NAME')

  const s3 = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })

  try {
    const arbimonSequelize = getArbimonSequelize()

    console.info('STEP: Get sites')
    const sites = await getSites(projectId, arbimonSequelize)
    const sitesCsv = await toCsv(sites)
    console.info(sitesCsv)

    console.info('STEP: Get recordings')
    const recordings = await getRecordings(projectId, arbimonSequelize)
    const recordingsWithUrls = await mapPathToSignedUrl(recordings, bucket, s3)
    const recordingsCsv = await toCsv(recordingsWithUrls)
    console.info(recordingsCsv)

    console.info('Export Project CSV end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('Export Project CSV end: failed')
  }
}

await main()
