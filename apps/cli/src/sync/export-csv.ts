import { S3Client } from '@aws-sdk/client-s3'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { toCsv } from '@rfcx-bio/utils/file'

import { requireEnv } from '~/env'
import { getSequelize } from '../db/connections'
import { createCommand } from './export-csv/create-command'
import { getOccurencesByMonth } from './export-csv/get-occurences-by-month'
import { getProjects } from './export-csv/get-projects'
import { getRecordingsByMonth } from './export-csv/get-recordings-by-month'
import { getSites } from './export-csv/get-sites'
import { getSpecies } from './export-csv/get-species'

const main = async (): Promise<void> => {
  console.info('CSV Export start')

  const startTime = dayjs()

  const {
    AWS_S3_BUCKET_REGION: region,
    AWS_S3_BUCKET_ACCESS_KEY_ID: accessKeyId,
    AWS_S3_BUCKET_SECRET_ACCESS_KEY: secretAccessKey,
    AWS_S3_BUCKET_NAME: bucketName
  } = requireEnv('AWS_S3_BUCKET_REGION', 'AWS_S3_BUCKET_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET_ACCESS_KEY_ID', 'AWS_S3_BUCKET_NAME')

  const s3 = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })

  try {
    const sequelize = getSequelize()

    console.info('STEP: Query projects data')
    const projects = await getProjects(sequelize)
    const projectsCsv = await toCsv(projects)
    const projectsCommand = createCommand(startTime, 'projects', bucketName, projectsCsv)

    console.info('STEP: Query sites data')
    const sites = await getSites(sequelize)
    const sitesCsv = await toCsv(sites)
    const sitesCommand = createCommand(startTime, 'sites', bucketName, sitesCsv)

    console.info('STEP: Query species data')
    const species = await getSpecies(sequelize)
    const speciesCsv = await toCsv(species)
    const speciesCommand = createCommand(startTime, 'species', bucketName, speciesCsv)

    console.info('STEP: Query occurences data')
    const occurences = await getOccurencesByMonth(sequelize)
    const occurencesCsv = await toCsv(occurences)
    const occurencesCommand = createCommand(startTime, 'occurences_by_month', bucketName, occurencesCsv)

    console.info('STEP: Query recordings data')
    const recordings = await getRecordingsByMonth(sequelize)
    const recordingsCsv = await toCsv(recordings)
    const recordingsCommand = createCommand(startTime, 'recordings_by_month', bucketName, recordingsCsv)

    console.info('STEP: Saving all data to S3 bucket')
    await Promise.all([
      s3.send(projectsCommand),
      s3.send(sitesCommand),
      s3.send(speciesCommand),
      s3.send(occurencesCommand),
      s3.send(recordingsCommand)
    ])

    console.info('CSV Export end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('CSV Export end: failed')
  }
}

await main()
