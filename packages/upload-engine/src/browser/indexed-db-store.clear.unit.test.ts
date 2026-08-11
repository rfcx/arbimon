/**
 * clearTerminal semantics (operator-reported 2026-08-11: failed/rejected
 * upload remnants were IMPOSSIBLE to clear from the panel).
 *
 * The defect: TERMINAL_STATES omitted 'failed', so "Clear completed" swept
 * ingested/duplicate/rejected but left every failed row forever. These tests
 * pin the corrected contract:
 *   - clearTerminal removes ingested, duplicate, rejected AND failed
 *   - it never touches live states (queued/preparing/…/uploading/paused)
 *
 * Runs against a real IndexedDB (fake-indexeddb in vitest config or the
 * browser); items are inserted through the store's own put().
 */
import { beforeEach, describe, expect, test } from 'vitest'

import type { UploadItem, UploadItemState } from '../types'
import { IndexedDbUploadStore } from './indexed-db-store'

import 'fake-indexeddb/auto'

const item = (id: string, state: UploadItemState): UploadItem => ({
  id,
  state,
  relativePath: `${id}.wav`,
  fileSizeBytes: 1000,
  siteId: 'site-1'
} as unknown as UploadItem)

describe('clearTerminal', () => {
  let store: IndexedDbUploadStore

  beforeEach(async () => {
    // the store opens a fixed DB name; wipe it between tests
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('arbimon-upload-engine')
      req.onsuccess = () => { resolve() }
      req.onerror = () => { resolve() }
      req.onblocked = () => { resolve() }
    })
    store = new IndexedDbUploadStore()
    for (const [id, state] of [
      ['a-ingested', 'ingested'],
      ['b-duplicate', 'duplicate'],
      ['c-rejected', 'rejected'],
      ['d-failed', 'failed'],
      ['e-queued', 'queued'],
      ['f-uploading', 'uploading'],
      ['g-paused', 'paused'],
      ['h-signed', 'signed']
    ] as Array<[string, UploadItemState]>) {
      await store.put(item(id, state))
    }
  })

  test('sweeps ALL four terminal states including failed (the un-clearable-remnants defect)', async () => {
    await store.clearTerminal()
    const left = await store.list()
    const leftIds = left.map(i => i.id).sort()
    expect(leftIds).toEqual(['e-queued', 'f-uploading', 'g-paused', 'h-signed'])
  })

  test('failed rows specifically are gone after clear', async () => {
    await store.clearTerminal()
    const failed = await store.list(['failed'])
    expect(failed).toEqual([])
  })

  test('live/in-flight rows are NEVER swept', async () => {
    await store.clearTerminal()
    for (const state of ['queued', 'uploading', 'paused', 'signed'] as UploadItemState[]) {
      const rows = await store.list([state])
      expect(rows.length, `state ${state} must survive clearTerminal`).toBe(1)
    }
  })

  test('clear is idempotent', async () => {
    await store.clearTerminal()
    await store.clearTerminal()
    const left = await store.list()
    expect(left.length).toBe(4)
  })
})
