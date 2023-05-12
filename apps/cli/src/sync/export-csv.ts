import { S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { WebClient } from '@slack/web-api'

import { dayjs } from '@rfcx-bio/utils/dayjs-initialized'
import { toCsv } from '@rfcx-bio/utils/file'

import { requireEnv } from '~/env'
import { getSequelize } from '../db/connections'
import { createGetCommand, createPutCommand } from './export-csv/create-command'
import { getOccurencesByMonth } from './export-csv/get-occurences-by-month'
import { getProjects } from './export-csv/get-projects'
import { getRecordingsByMonth } from './export-csv/get-recordings-by-month'
import { getSites } from './export-csv/get-sites'
import { getSpecies } from './export-csv/get-species'

const ONE_WEEK_IN_SECONDS = 86400 * 7

const main = async (): Promise<void> => {
  console.info('CSV Export start')

  const startTime = dayjs().utc()

  const {
    AWS_S3_BUCKET_REGION: region,
    AWS_S3_BUCKET_ACCESS_KEY_ID: accessKeyId,
    AWS_S3_BUCKET_SECRET_ACCESS_KEY: secretAccessKey,
    AWS_S3_BUCKET_NAME: bucketName,
    SLACK_TOKEN: slackToken,
    BIO_ENVIRONMENT: bioEnvironment
  } = requireEnv('AWS_S3_BUCKET_REGION', 'AWS_S3_BUCKET_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET_ACCESS_KEY_ID', 'AWS_S3_BUCKET_NAME', 'SLACK_TOKEN', 'BIO_ENVIRONMENT')

  const s3 = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })

  const web = new WebClient(slackToken)

  try {
    const sequelize = getSequelize()

    console.info('STEP: Query projects data')
    const projects = await getProjects(sequelize)
    const projectsCsv = await toCsv(projects)
    const [projectsCommand, projectsS3Filename] = createPutCommand(startTime, 'projects', bucketName, projectsCsv)

    console.info('STEP: Query sites data')
    const sites = await getSites(sequelize)
    const sitesCsv = await toCsv(sites)
    const [sitesCommand, sitesS3Filename] = createPutCommand(startTime, 'sites', bucketName, sitesCsv)

    console.info('STEP: Query species data')
    const species = await getSpecies(sequelize)
    const speciesCsv = await toCsv(species)
    const [speciesCommand, speciesS3Filename] = createPutCommand(startTime, 'species', bucketName, speciesCsv)

    console.info('STEP: Query occurences data')
    const occurences = await getOccurencesByMonth(sequelize)
    const occurencesCsv = await toCsv(occurences)
    const [occurencesCommand, occurencesS3Filename] = createPutCommand(startTime, 'occurences_by_month', bucketName, occurencesCsv)

    console.info('STEP: Query recordings data')
    const recordings = await getRecordingsByMonth(sequelize)
    const recordingsCsv = await toCsv(recordings)
    const [recordingsCommand, recordingsS3Filename] = createPutCommand(startTime, 'recordings_by_month', bucketName, recordingsCsv)

    console.info('STEP: Saving all data to S3 bucket')
    await Promise.all([
      s3.send(projectsCommand),
      s3.send(sitesCommand),
      s3.send(speciesCommand),
      s3.send(occurencesCommand),
      s3.send(recordingsCommand)
    ])

    console.info('STEP: Generating signed S3 url')
    const [
      projectsS3GetCommand,
      sitesS3GetCommand,
      speciesS3GetCommand,
      occurencesS3GetCommand,
      recordingsS3GetCommand
    ] = await Promise.all([
      createGetCommand(projectsS3Filename, bucketName),
      createGetCommand(sitesS3Filename, bucketName),
      createGetCommand(speciesS3Filename, bucketName),
      createGetCommand(occurencesS3Filename, bucketName),
      createGetCommand(recordingsS3Filename, bucketName)
    ])

    const [
      projectsS3Url,
      sitesS3Url,
      speciesS3Url,
      occurencesS3Url,
      recordingsS3Url
    ] = await Promise.all([
      getSignedUrl(s3, projectsS3GetCommand, { expiresIn: ONE_WEEK_IN_SECONDS }),
      getSignedUrl(s3, sitesS3GetCommand, { expiresIn: ONE_WEEK_IN_SECONDS }),
      getSignedUrl(s3, speciesS3GetCommand, { expiresIn: ONE_WEEK_IN_SECONDS }),
      getSignedUrl(s3, occurencesS3GetCommand, { expiresIn: ONE_WEEK_IN_SECONDS }),
      getSignedUrl(s3, recordingsS3GetCommand, { expiresIn: ONE_WEEK_IN_SECONDS })
    ])

    console.info('STEP: Notifying in slack channel')
    await web.chat.postMessage({
      channel: '#arbimon-dev',
      text: [
        `✅ export-csv in ${bioEnvironment} job runs successfully`,
        `projects: <${projectsS3Url}|projects.csv>`,
        `sites: <${sitesS3Url}|sites.csv>`,
        `species: <${speciesS3Url}|species.csv>`,
        `occurences by month: <${occurencesS3Url}|occurences_by_month.csv>`,
        `recordings by month: <${recordingsS3Url}|recordings_by_month.csv>`,
        '',
        'link expires in 7 days'
      ].join('\n')
    })

    console.info('CSV Export end: successful')
  } catch (e) {
    console.error(e)
    process.exitCode = 1
    console.info('CSV Export end: failed while querying and saving the data')
    await web.chat.postMessage({
      channel: '#arbimon-dev',
      text: '❌ export-csv job failed to run'
    })
  }
}

await main()
