import { type S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { parse } from 'path'

export const ONE_WEEK_IN_SECONDS = 86400 * 7

export const generateSignedUrl = async (s3: S3Client, bucket: string, path: string): Promise<string> => {
  const parsedPath = parse(path)
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: path,
    ResponseContentDisposition: `attachment; filename=${parsedPath.base}`
  })
  return await getSignedUrl(s3, command, { expiresIn: ONE_WEEK_IN_SECONDS })
}
