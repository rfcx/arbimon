import QuickLRU from 'quick-lru'

import { type StorageClient } from '@rfcx-bio/node-common/storage'

import { requireEnv } from '~/env'

interface PathMapableRow {
  path?: string | null
}

const { AWS_S3_CORE_BUCKET_NAME: coreBucketName } = requireEnv('AWS_S3_CORE_BUCKET_NAME')

const cache = new QuickLRU<string, string>({ maxSize: Infinity })

export const mapPathToSignedUrl = async <T extends PathMapableRow>(records: T[], storage: StorageClient, legacyStorage: StorageClient): Promise<Array<Omit<T, 'path'> & { url: string }>> => {
  const results: Array<Omit<T, 'path'> & { url: string }> = []
  for (const { path, ...r } of records) {
    if (!path) {
      results.push({ ...r, url: '' })
      continue
    }

    let url = cache.get(path)
    if (url === undefined) {
      if (path.startsWith('project_')) { // Looks like a path from legacy bucket
        url = await legacyStorage.getObjectSignedUrl(path)
      } else {
        url = await storage.getObjectSignedUrl(path, coreBucketName)
      }
      cache.set(path, url)
    }
    results.push({ ...r, url })
  }
  return results
}
