import { type S3Client } from '@aws-sdk/client-s3'
import QuickLRU from 'quick-lru'

import { generateSignedUrl } from './generate-signed-url'

interface PathMapableRow {
  uri: string
}

const cache = new QuickLRU<string, string>({ maxSize: Infinity })

export const mapPathToSignedUrl = async <T extends PathMapableRow>(records: T[], bucket: string, s3: S3Client): Promise<Array<Omit<T, 'uri'> & { url: string }>> => {
  const results: Array<Omit<T, 'uri'> & { url: string }> = []
  for (const { uri, ...r } of records) {
    let url = cache.get(uri)
    if (url === undefined) {
      url = await generateSignedUrl(s3, bucket, uri)
      cache.set(uri, url)
    }
    results.push({ ...r, url })
  }
  return results
}
