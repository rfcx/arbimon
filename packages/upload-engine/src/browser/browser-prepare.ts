/**
 * Browser prepare step: sha1 + audio-header probe + filename timestamp parse.
 * Runs on the main thread for now (sha1 via WebCrypto is fast and async);
 * moving to a Web Worker is a drop-in change later (the engine only sees
 * the PrepareFn signature).
 */

import { probeAudioMetadata } from '../audio-metadata'
import { type PrepareResult } from '../engine'
import { sha1HexOfBlob } from '../sha1'
import { parseTimestamp, TIMESTAMP_FORMAT_AUTO, toUtcIso } from '../timestamp-parser'
import { type UploadItem } from '../types'

export interface BrowserPrepareOptions {
  /** Per-site timestamp format (desktop-app compatible). Default auto. */
  timestampFormat?: string
  /** IANA timezone or fixed offset minutes for local-naive filenames. */
  timezone?: string | number
}

export const makeBrowserPrepare =
  (options: BrowserPrepareOptions = {}) =>
  async (item: UploadItem, file: Blob): Promise<PrepareResult> => {
    const parsed = parseTimestamp(
      item.filename,
      options.timestampFormat ?? TIMESTAMP_FORMAT_AUTO
    )
    if (parsed === undefined) {
      return {
        error: 'Could not parse a recording timestamp from the filename.'
      }
    }
    const timestampUtc = toUtcIso(parsed, options.timezone)
    if (timestampUtc === undefined) {
      return { error: 'Parsed timestamp is not a valid date.' }
    }
    const [checksumSha1, metadata] = await Promise.all([
      sha1HexOfBlob(file),
      probeAudioMetadata(file)
    ])
    return {
      timestampUtc,
      checksumSha1,
      durationMs: metadata.durationMs,
      sampleRateHz: metadata.sampleRateHz
    }
  }
