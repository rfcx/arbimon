/**
 * Does `progress` survive a round-trip through the store?
 *
 * WHY THIS TEST EXISTS: `IndexedDbUploadStore.serializable()` strips `progress`
 * before persisting ("transient field"), but `UploadEngine.stats()` computes
 * partial `bytesUploaded` from `item.progress` on items it read back via
 * `store.list()`. If the strip really does erase it, that branch can never
 * contribute and the in-flight bytes of an uploading file are invisible to the
 * progress bar until the file completes.
 *
 * Measured, not assumed.
 */
import { describe, expect, it } from 'vitest'

import type { UploadItem } from '../types'
import { IndexedDbUploadStore } from './indexed-db-store'

import 'fake-indexeddb/auto'

function item (over: Partial<UploadItem> = {}): UploadItem {
  const base: UploadItem = {
    id: 'i1',
    state: 'uploading',
    filename: 'a.wav',
    fileSizeBytes: 1000,
    createdAtMs: 1,
    updatedAtMs: 1,
    attempts: 0,
    streamId: 's1',
    relativePath: 'a.wav',
    progress: 0.5
  }
  return { ...base, ...over }
}

describe('IndexedDbUploadStore progress round-trip', () => {
  it('DROPS progress on persist (documents the transient-field behaviour)', async () => {
    const store = new IndexedDbUploadStore()
    await store.put(item())

    const got = await store.get('i1')
    expect(got).toBeDefined()
    // serializable() strips it: what comes back has no progress.
    expect(got?.progress).toBeUndefined()

    const listed = await store.list()
    expect(listed).toHaveLength(1)
    expect(listed[0].progress).toBeUndefined()
  })
})
