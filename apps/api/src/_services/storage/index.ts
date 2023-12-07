import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { type Readable } from 'node:stream'

import { BioPublicError } from '~/errors'
import { env } from '../env'

const {
  AWS_S3_ENDPOINT: endpoint,
  AWS_S3_BUCKET_REGION: region,
  AWS_S3_BUCKET_NAME: bucketName,
  AWS_S3_ACCESS_KEY_ID: accessKeyId,
  AWS_S3_SECRET_ACCESS_KEY: secretAccessKey
} = env

let s3: S3Client | null = null
export const getS3Client = (): S3Client => {
  if (s3 == null) {
    if (
      accessKeyId == null || accessKeyId === '' ||
      secretAccessKey == null || secretAccessKey === '' ||
      bucketName == null || bucketName === '' ||
      region == null || region === ''
    ) {
      throw new BioPublicError('AWS S3 bucket credentials are not defined', 500)
    }

    s3 = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    })

    return s3
  }

  return s3
}

export const getObject = async (key: string): Promise<ArrayBuffer> => {
  const client = getS3Client()

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  })

  const response = await client.send(command)
  const stream = response.Body as Readable

  return await new Promise<ArrayBuffer>((resolve, reject) => {
    const chunks: Buffer[] = []

    stream.on('data', chunk => chunks.push(chunk))
    stream.once('error', () => { reject(new BioPublicError('Cannot parse image from AWS S3 into file correctly', 500)) })
    stream.once('end', () => { resolve(Buffer.concat(chunks)) })
  })
}

export const putObject = async (key: string, body: Buffer, mimetype: string): Promise<void> => {
  const client = getS3Client()

  console.info('can get client succesfully')

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: mimetype
  })

  await client.send(command)
}
