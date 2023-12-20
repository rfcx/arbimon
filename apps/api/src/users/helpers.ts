import { env } from '../_services/env'

const {
  AWS_S3_BUCKET_NAME: bucketName,
  AWS_S3_BUCKET_REGION: bucketRegion
} = env

export const getProfileImageURL = (profileImageUrl: string | undefined): string | undefined => {
  if (profileImageUrl == null) {
    return undefined
  }

  try {
    const imageUrl = new URL(profileImageUrl)
    return imageUrl.toString()
  } catch (e) {
    return `https://${bucketName}.s3-${bucketRegion}.amazonaws.com/${profileImageUrl}`
  }
}
