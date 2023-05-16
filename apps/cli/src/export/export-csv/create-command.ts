import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { type Dayjs } from 'dayjs'
import { parse } from 'path'

import { getFilename } from './get-filename'

/*
 * Type of file that you wanted to export. This will become the filename
 */
export type Filetype = 'projects' | 'sites' | 'species' | 'occurences_by_month' | 'recordings_by_month'

export const createPutCommand = (startTime: Dayjs, filetype: Filetype, bucket: string, body: string): [PutObjectCommand, string] => {
  const filename = getFilename(startTime, filetype)

  return [new PutObjectCommand({
    Bucket: bucket,
    Key: filename,
    Body: body,
    ContentType: 'text/csv'
  }), filename]
}

export const createGetCommand = (filename: string, bucket: string): GetObjectCommand => {
  const parsedPath = parse(filename)

  return new GetObjectCommand({
    Bucket: bucket,
    Key: filename,
    // parsedPath.base gives out the filename with extension e.g. `projects.csv`
    ResponseContentDisposition: `attachment; filename=${parsedPath.base}`
  })
}
