/**
 * Browser prepare step: sha1 + audio-header probe + filename timestamp parse.
 * Runs on the main thread for now (sha1 via WebCrypto is fast and async);
 * moving to a Web Worker is a drop-in change later (the engine only sees
 * the PrepareFn signature).
 */

import { probeAudioMetadata } from '../audio-metadata'
import { type PrepareResult } from '../engine'
import { sha1HexOfBlob } from '../sha1'
import { type SavedTimestampFormat, matchTimestamp, parseTimestamp, TIMESTAMP_FORMAT_AUTO, toUtcIso } from '../timestamp-parser'
import { type UploadItem } from '../types'

export interface BrowserPrepareOptions {
  /** Per-site timestamp format (desktop-app compatible). Default auto. */
  timestampFormat?: string
  /** IANA timezone or fixed offset minutes for local-naive filenames. */
  timezone?: string | number
  /**
   * The user's saved filename formats, in precedence order. Used ONLY on the
   * fallback path below (an item that reaches prepare without an analyzed
   * timestamp). Kept in step with `analyzeFile`'s context deliberately: if
   * staging recognised a name via a saved format, a re-prepare must be able to
   * recognise it the same way rather than failing where staging succeeded.
   */
  savedFormats?: SavedTimestampFormat[]
}

export const makeBrowserPrepare =
  (options: BrowserPrepareOptions = {}) =>
  async (item: UploadItem, file: Blob): Promise<PrepareResult> => {
    // Staged-analysis flow (2026-08-12): the analyze step already decided the
    // timestamp via the timezone ladder (filename offset > file metadata >
    // site tz > UTC). Re-parsing here would CLOBBER that decision with a
    // plain filename parse — respect the analyzed value when present.
    let timestampUtc = item.timestampUtc
    if (timestampUtc === undefined) {
      // An explicit per-site format still wins outright (desktop parity);
      // otherwise fall back to auto-detect PLUS the user's saved formats, the
      // same chain and order staging used.
      const parsed = options.timestampFormat !== undefined && options.timestampFormat !== TIMESTAMP_FORMAT_AUTO
        ? parseTimestamp(item.filename, options.timestampFormat)
        : matchTimestamp(item.filename, options.savedFormats)?.timestamp
      if (parsed === undefined) {
        return {
          error: 'Could not parse a recording timestamp from the filename.'
        }
      }
      timestampUtc = toUtcIso(parsed, options.timezone)
      if (timestampUtc === undefined) {
        return { error: 'Parsed timestamp is not a valid date.' }
      }
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
