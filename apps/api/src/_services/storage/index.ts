import { StorageClient } from '@rfcx-bio/node-common/storage'

import { env } from '../env'

const {
  AWS_S3_ENDPOINT: endpoint,
  AWS_S3_BUCKET_REGION: region,
  AWS_S3_BUCKET_NAME: defaultBucketName,
  AWS_S3_ACCESS_KEY_ID: accessKeyId,
  AWS_S3_SECRET_ACCESS_KEY: secretAccessKey
} = env

export const getS3Client = (): StorageClient => {
    return new StorageClient({ accessKeyId, secretAccessKey, defaultBucketName, region, endpoint })
}
