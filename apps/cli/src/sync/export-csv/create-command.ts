import { PutObjectCommand } from '@aws-sdk/client-s3'
import { type Dayjs } from 'dayjs'

import { getFilename } from './get-filename'

/*
 * Type of file that you wanted to export. This will become the filename
 */
export type Filetype = 'projects' | 'sites' | 'species' | 'occurences_by_month' | 'recordings_by_month'

export const createCommand = (startTime: Dayjs, filetype: Filetype, bucket: string, body: string): PutObjectCommand => {
  const filename = getFilename(startTime, filetype)

  return new PutObjectCommand({
    Bucket: bucket,
    Key: filename,
    Body: body,
    ContentType: 'text/csv'
  })
}
