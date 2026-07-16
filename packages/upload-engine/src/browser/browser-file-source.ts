/**
 * Browser FileSource: holds File handles in memory for the session.
 *
 * File objects are NOT persistable in IndexedDB across a tab close in all
 * browsers (structured-clone of File works in Chromium but the underlying
 * handle may become stale). v1 approach: keep handles in-memory; after a
 * reload, items whose handles are gone surface as 'rejected: File handle
 * lost' and the user re-drops the folder — matching Google Drive's behavior
 * for interrupted sessions. FS Access API persistent handles are a v2
 * upgrade (Chromium-only).
 */

import { type FileSource } from '../types'

export class BrowserFileSource implements FileSource {
  private readonly files = new Map<string, File>()

  register (itemId: string, file: File): void {
    this.files.set(itemId, file)
  }

  unregister (itemId: string): void {
    this.files.delete(itemId)
  }

  async getFile (itemId: string): Promise<Blob | undefined> {
    return this.files.get(itemId)
  }

  clear (): void {
    this.files.clear()
  }
}

/** Recursively collect files from a DataTransfer (drag-drop of folders). */
export const collectDroppedFiles = async (
  dataTransfer: DataTransfer
): Promise<Array<{ file: File, relativePath: string }>> => {
  const out: Array<{ file: File, relativePath: string }> = []

  const walkEntry = async (
    entry: FileSystemEntry,
    pathPrefix: string
  ): Promise<void> => {
    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) => {
        ;(entry as FileSystemFileEntry).file(resolve, reject)
      })
      out.push({ file, relativePath: pathPrefix + file.name })
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader()
      // readEntries returns results in chunks; loop until empty.
      let batch: FileSystemEntry[]
      do {
        batch = await new Promise<FileSystemEntry[]>((resolve, reject) => {
          reader.readEntries(resolve, reject)
        })
        for (const child of batch) {
          await walkEntry(child, `${pathPrefix}${entry.name}/`)
        }
      } while (batch.length > 0)
    }
  }

  const items = Array.from(dataTransfer.items)
  const entries = items
    .map(item => item.webkitGetAsEntry())
    .filter((entry): entry is FileSystemEntry => entry !== null)

  if (entries.length > 0) {
    for (const entry of entries) await walkEntry(entry, '')
  } else {
    for (const file of Array.from(dataTransfer.files)) {
      out.push({ file, relativePath: file.name })
    }
  }
  return out
}

const SUPPORTED_EXTENSIONS = new Set(['wav', 'flac', 'opus'])

export const isSupportedAudioFile = (fileName: string): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  return SUPPORTED_EXTENSIONS.has(extension)
}
