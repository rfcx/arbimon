import { StorageClient } from '@rfcx-bio/node-common/storage'

import { optionalEnv, requireEnv } from '~/env'

const {
    AWS_S3_ENDPOINT: endpoint,
    AWS_S3_LEGACY_BUCKET_NAME: legacyBucketName,
    AWS_S3_LEGACY_BUCKET_REGION: legacyRegion
} = optionalEnv('AWS_S3_ENDPOINT', 'AWS_S3_LEGACY_BUCKET_NAME', 'AWS_S3_LEGACY_BUCKET_REGION')

const {
    AWS_S3_ACCESS_KEY_ID: accessKeyId,
    AWS_S3_SECRET_ACCESS_KEY: secretAccessKey,
    AWS_S3_BUCKET_REGION: region,
    AWS_S3_BUCKET_NAME: defaultBucketName
  } = requireEnv('AWS_S3_ACCESS_KEY_ID', 'AWS_S3_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET_NAME', 'AWS_S3_BUCKET_REGION')

export const getStorageClient = (): StorageClient => {
    return new StorageClient({ accessKeyId, secretAccessKey, defaultBucketName, region, endpoint })
}

export const getLegacyStorageClient = (): StorageClient => {
    if (legacyBucketName === undefined || legacyRegion === undefined) {
        throw new Error('Unable to get legacy storage client with undefined AWS_S3_LEGACY_BUCKET_NAME and AWS_S3_LEGACY_BUCKET_REGION')
    }
    return new StorageClient({ accessKeyId, secretAccessKey, defaultBucketName: legacyBucketName, region: legacyRegion, endpoint })
}
