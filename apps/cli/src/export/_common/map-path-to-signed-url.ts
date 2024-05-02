import QuickLRU from 'quick-lru'

import { type StorageClient } from '@rfcx-bio/common/storage'

interface PathMapableRow {
  path: string
}

const cache = new QuickLRU<string, string>({ maxSize: Infinity })

export const mapPathToSignedUrl = async <T extends PathMapableRow>(records: T[], storage: StorageClient, legacyStorage: StorageClient): Promise<Array<Omit<T, 'path'> & { url: string }>> => {
  const results: Array<Omit<T, 'path'> & { url: string }> = []
  for (const { path, ...r } of records) {
    let url = cache.get(path)
    if (url === undefined) {
      if (path.startsWith('project_')) { // Looks like a path from legacy bucket
        url = await legacyStorage.getObjectSignedUrl(path)
      } else {
        url = await storage.getObjectSignedUrl(path)
      }
      cache.set(path, url)
    }
    results.push({ ...r, url })
  }
  return results
}
