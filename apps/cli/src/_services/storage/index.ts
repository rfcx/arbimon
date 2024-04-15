import { StorageClient } from '@rfcx-bio/common/storage'

import { optionalEnv, requireEnv } from '~/env'

const {
    AWS_S3_ENDPOINT: endpoint
} = optionalEnv('AWS_S3_ENDPOINT')

const {
    AWS_S3_BUCKET_REGION: region,
    AWS_S3_BUCKET_NAME: bucketName,
    AWS_S3_ACCESS_KEY_ID: accessKeyId,
    AWS_S3_SECRET_ACCESS_KEY: secretAccessKey
} = requireEnv('AWS_S3_BUCKET_REGION', 'AWS_S3_BUCKET_NAME', 'AWS_S3_ACCESS_KEY_ID', 'AWS_S3_SECRET_ACCESS_KEY')

export const getStorageClient = (): StorageClient => {
    return new StorageClient({ accessKeyId, secretAccessKey, bucketName, region, endpoint })
}
