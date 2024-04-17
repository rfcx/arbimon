import { type S3Client } from '@aws-sdk/client-s3'
import QuickLRU from 'quick-lru'

import { generateSignedUrl } from './generate-signed-url'

interface PathMapableRow {
  path: string
}

const cache = new QuickLRU<string, string>({ maxSize: Infinity })

export const mapPathToSignedUrl = async <T extends PathMapableRow>(records: T[], bucket: string, s3: S3Client): Promise<Array<Omit<T, 'path'> & { url: string }>> => {
  const results: Array<Omit<T, 'path'> & { url: string }> = []
  for (const { path, ...r } of records) {
    let url = cache.get(path)
    if (url === undefined) {
      url = await generateSignedUrl(s3, bucket, path)
      cache.set(path, url)
    }
    results.push({ ...r, url })
  }
  return results
}
