/**
 * IndexedDB-backed UploadStore (browser adapter).
 * One object store keyed by item id, with a state index for queue scans.
 * Survives tab close/crash — the engine resumes from persisted state.
 */

import { type UploadItem, type UploadItemState, type UploadStore } from '../types'

const DB_NAME = 'arbimon-upload-engine'
const DB_VERSION = 1
const STORE = 'upload-items'

const TERMINAL_STATES: UploadItemState[] = ['ingested', 'duplicate', 'rejected']

const openDb = async (): Promise<IDBDatabase> =>
  await new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('state', 'state')
        store.createIndex('createdAtMs', 'createdAtMs')
      }
    }
    request.onsuccess = () => {
      resolve(request.result)
    }
    request.onerror = () => {
      reject(request.error ?? new Error('IndexedDB open failed'))
    }
  })

const requestToPromise = async <T>(request: IDBRequest<T>): Promise<T> =>
  await new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result)
    }
    request.onerror = () => {
      reject(request.error ?? new Error('IndexedDB request failed'))
    }
  })

export class IndexedDbUploadStore implements UploadStore {
  private dbPromise: Promise<IDBDatabase> | undefined

  private async db (): Promise<IDBDatabase> {
    this.dbPromise ??= openDb()
    return await this.dbPromise
  }

  async put (item: UploadItem): Promise<void> {
    const db = await this.db()
    const tx = db.transaction(STORE, 'readwrite')
    await requestToPromise(tx.objectStore(STORE).put(this.serializable(item)))
  }

  async putMany (items: UploadItem[]): Promise<void> {
    const db = await this.db()
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    for (const item of items) store.put(this.serializable(item))
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => {
        resolve()
      }
      tx.onerror = () => {
        reject(tx.error ?? new Error('IndexedDB tx failed'))
      }
    })
  }

  async get (id: string): Promise<UploadItem | undefined> {
    const db = await this.db()
    const tx = db.transaction(STORE, 'readonly')
    return (await requestToPromise(tx.objectStore(STORE).get(id))) as
      | UploadItem
      | undefined
  }

  async list (states?: UploadItemState[]): Promise<UploadItem[]> {
    const db = await this.db()
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    if (states === undefined) {
      const all = (await requestToPromise(store.getAll())) as UploadItem[]
      return all.sort((a, b) => a.createdAtMs - b.createdAtMs)
    }
    const results: UploadItem[] = []
    for (const state of states) {
      const byState = (await requestToPromise(
        store.index('state').getAll(state)
      )) as UploadItem[]
      results.push(...byState)
    }
    return results.sort((a, b) => a.createdAtMs - b.createdAtMs)
  }

  async delete (id: string): Promise<void> {
    const db = await this.db()
    const tx = db.transaction(STORE, 'readwrite')
    await requestToPromise(tx.objectStore(STORE).delete(id))
  }

  async clearTerminal (): Promise<void> {
    const items = await this.list(TERMINAL_STATES)
    const db = await this.db()
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    for (const item of items) store.delete(item.id)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => {
        resolve()
      }
      tx.onerror = () => {
        reject(tx.error ?? new Error('IndexedDB tx failed'))
      }
    })
  }

  /** Strip transient fields before persisting. */
  private serializable (item: UploadItem): UploadItem {
    const { progress, ...rest } = item
    return rest as UploadItem
  }
}
