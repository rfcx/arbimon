/**
 * BASELINE MEASUREMENT for the §5.5 `stats()` full-table-scan item.
 *
 * The continuation prompt claims a ~12x speedup is available (3.93ms -> 0.36ms
 * at depth 1,586) "by using the existing `state` index". This test measures the
 * two shapes against a real IndexedDB (fake-indexeddb) so the claim is checked
 * rather than inherited:
 *
 *   A) store.list()            -> getAll() + full deserialization of every row
 *   B) index('state').count()  -> per-state counts read from the index
 *
 * NOTE (B) is NOT a drop-in replacement: stats() also sums bytesTotal /
 * bytesUploaded, which counts alone cannot provide. This measures the ceiling
 * of the index approach, not a finished design.
 */
import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { IndexedDbUploadStore } from './indexed-db-store'
import type { UploadItem, UploadItemState } from '../types'

const STATES: UploadItemState[] = [
  'analyzing', 'staged', 'queued', 'preparing', 'ready', 'signing',
  'signed', 'uploading', 'uploaded', 'ingested', 'duplicate', 'failed',
  'rejected', 'cancelled', 'paused'
]

const DEPTH = Number(process.env.BENCH_DEPTH ?? 1586) // Perth batch size in the prompt
const REPS = Number(process.env.BENCH_REPS ?? 5)      // repeat to expose variance

function mk (i: number): UploadItem {
  return {
    id: `i${i}`,
    state: STATES[i % STATES.length],
    filename: `file-${i}.wav`,
    fileSizeBytes: 1024 * 1024,
    createdAtMs: i,
    updatedAtMs: i,
    attempts: 0,
    streamId: `stream-${i % 7}`
  } as UploadItem
}

describe(`stats() cost at depth ${DEPTH}`, () => {
  it('measures full list() vs per-state index count()', async () => {
    const store = new IndexedDbUploadStore()
    const items = Array.from({ length: DEPTH }, (_, i) => mk(i))
    await store.putMany(items)

    // A) what stats() does today -- median of REPS to avoid a one-shot artifact
    const listTimes: number[] = []
    let all: UploadItem[] = []
    let bytes = 0
    for (let r = 0; r < REPS; r++) {
      const t0 = performance.now()
      all = await store.list()
      bytes = 0
      for (const it of all) bytes += it.fileSizeBytes
      listTimes.push(performance.now() - t0)
    }
    const median = (xs: number[]): number =>
      [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
    const tList = median(listTimes)

    expect(all).toHaveLength(DEPTH)
    expect(bytes).toBe(DEPTH * 1024 * 1024)

    // B) index-only counts (ceiling of the proposed approach)
    const db = await (store as unknown as { db: () => Promise<IDBDatabase> }).db()
    const idxTimes: number[] = []
    let counts: number[] = []
    for (let r = 0; r < REPS; r++) {
      const t1 = performance.now()
      const tx = db.transaction('upload-items', 'readonly')
      const idx = tx.objectStore('upload-items').index('state')
      counts = await Promise.all(
        STATES.map(async s => await new Promise<number>((res, rej) => {
          const rq = idx.count(s)
          rq.onsuccess = () => { res(rq.result) }
          rq.onerror = () => { rej(rq.error) }
        }))
      )
      idxTimes.push(performance.now() - t1)
    }
    const tIndex = median(idxTimes)

    expect(counts.reduce((a, b) => a + b, 0)).toBe(DEPTH)

    // C) a SINGLE index count() -- the suspected source of the prompt's "0.36ms"
    const t2 = performance.now()
    const tx2 = db.transaction('upload-items', 'readonly')
    const idx2 = tx2.objectStore('upload-items').index('state')
    await new Promise<number>((res, rej) => {
      const r = idx2.count('uploaded')
      r.onsuccess = () => { res(r.result) }
      r.onerror = () => { rej(r.error) }
    })
    const tOne = performance.now() - t2

    // D) getAll() WITHOUT the sort list() applies, to price the sort separately
    const t3 = performance.now()
    const tx3 = db.transaction('upload-items', 'readonly')
    await new Promise<unknown>((res, rej) => {
      const r = tx3.objectStore('upload-items').getAll()
      r.onsuccess = () => { res(r.result) }
      r.onerror = () => { rej(r.error) }
    })
    const tGetAll = performance.now() - t3

    console.log(`\n[stats bench @ depth ${DEPTH}]`)
    console.log(`  A) list() + sum        : ${tList.toFixed(2)} ms   <- what stats() does today`)
    console.log(`  B) index count() x15   : ${tIndex.toFixed(2)} ms   -> speedup ${(tList / tIndex).toFixed(1)}x`)
    console.log(`  C) index count() x1    : ${tOne.toFixed(2)} ms   -> "speedup" ${(tList / tOne).toFixed(1)}x (NOT a full stats object)`)
    console.log(`  D) getAll(), no sort   : ${tGetAll.toFixed(2)} ms   (sort cost = ${(tList - tGetAll).toFixed(2)} ms)\n`)
  })
})