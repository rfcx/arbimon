/**
 * Staged-intake analysis (import-recordings rebuild, 2026-08-12).
 *
 * Runs BEFORE anything enters the upload pipeline: cheap, local, bounded
 * header reads — no sha1, no network. Produces everything the staging table
 * shows (recording date/time, timezone + how it was determined, format,
 * duration) and the UTC timestamp the eventual sign request will carry.
 *
 * Timezone decision ladder (mode 'auto'):
 *   1. explicit offset in the parsed FILENAME            → 'filename-offset'
 *   2. embedded file metadata (GUANO / AudioMoth ICMT)   → 'file-metadata'
 *      (the metadata's own wall time also REPLACES the filename time —
 *       it is the recorder's own clock statement)
 *   3. site's IANA timezone applied to the naive time    → 'site-local'
 *   4. UTC                                               → 'utc-fallback'
 * Modes 'site' / 'utc' force rungs 3 / 4 ('forced-site' / 'forced-utc') and
 * ignore embedded metadata offsets (deliberate: the user overrode).
 *
 * FAIL SOFT: a file we cannot derive a timestamp for still stages — with
 * analysisError set so the table shows why and Start skips it.
 */

import { probeAudioMetadata } from './audio-metadata'
import { checkRecordingProvenance, historicalDateNotice } from './recorder-provenance'
import { parseTimestamp, TIMESTAMP_FORMAT_AUTO, toUtcIso } from './timestamp-parser'
import { type TimezoneSource, type UploadItem } from './types'
import { extractEmbeddedTimestamp, formatOffset } from './wav-embedded-timestamp'

export type TimezoneMode = 'auto' | 'site' | 'utc' | 'metadata'

export interface AnalyzeContext {
  mode: TimezoneMode
  /** Site IANA timezone ('' / undefined when the site has none). */
  siteTimezone?: string
  /** Site display name (denormalized into the item for the table). */
  siteName?: string
}

export interface AnalyzeResult {
  patch: Partial<UploadItem>
}

const offsetFromIso = (iso: string): number | undefined => {
  const m = iso.match(/(Z|[+-]\d{2}:?\d{2})$/)
  if (m === null) return undefined
  if (m[1] === 'Z') return 0
  const zm = m[1].match(/^([+-])(\d{2}):?(\d{2})$/)
  if (zm === null) return undefined
  const sign = zm[1] === '-' ? -1 : 1
  return sign * (parseInt(zm[2]) * 60 + parseInt(zm[3]))
}

/**
 * Detect an explicit UTC-offset token in a FILENAME (e.g. `…_193000+0700.wav`,
 * `…-0500_`, `…Z.wav`). The auto-detect timestamp patterns do NOT capture
 * offsets (desktop parity), so this is a separate scan. Deliberately strict:
 * the token must trail a digit run (i.e. sit right after the time part) so a
 * stray `-1030` in a site code can't masquerade as an offset — hour is
 * bounded 00..14 (real UTC offsets) and minutes 00/15/30/45.
 */
const detectFilenameOffset = (filename: string): number | undefined => {
  const base = filename.replace(/\.[^./]+$/, '')
  const m = base.match(/\d([+-])(0\d|1[0-4]):?(00|15|30|45)(?=[^\d]|$)/)
  if (m !== null) {
    const sign = m[1] === '-' ? -1 : 1
    return sign * (parseInt(m[2]) * 60 + parseInt(m[3]))
  }
  if (/\dZ(?=[^a-zA-Z0-9]|$)/.test(base)) return 0
  return undefined
}

const stripOffset = (iso: string): string => iso.replace(/(Z|[+-]\d{2}:?\d{2})$/, '')

const applyFixedOffset = (wallTime: string, offsetMinutes: number): string | undefined => {
  const date = new Date(`${wallTime}Z`)
  if (isNaN(date.getTime())) return undefined
  return new Date(date.getTime() - offsetMinutes * 60_000).toISOString()
}

const detectFormat = (filename: string): UploadItem['fileFormat'] => {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'wav') return 'wav'
  if (ext === 'flac') return 'flac'
  if (ext === 'opus') return 'opus'
  // AIFF (2026-08-17, alongside ingest #122). Reported for accurate display
  // only -- it deliberately does NOT unlock the WAV-only paths below
  // (embedded GUANO/ICMT scanning, FLAC-transcode-on-upload), which are
  // genuinely WAV-specific. Before this, AIFF fell through to 'unknown'.
  if (ext === 'aiff' || ext === 'aif') return 'aiff'
  return 'unknown'
}

/**
 * Analyze one file for staging. Never throws — failures land in
 * patch.analysisError.
 */
export async function analyzeFile (
  item: UploadItem,
  file: Blob,
  context: AnalyzeContext
): Promise<AnalyzeResult> {
  // analysisError starts EXPLICITLY undefined: engine.update() MERGES patches,
  // so re-analysis (e.g. the session timezone-method selector changing) must
  // actively clear a previous mode's error or it sticks to the row forever —
  // observed live 2026-08-13: a 'metadata'-mode error survived switching back
  // to 'auto' even though the row re-dated correctly.
  const patch: Partial<UploadItem> = { state: 'staged', analysisError: undefined }

  // -- format + duration (header probe; bounded read) ------------------------
  try {
    const meta = await probeAudioMetadata(file)
    patch.durationMs = meta.durationMs
    patch.sampleRateHz = meta.sampleRateHz
    patch.bitDepth = meta.bitDepth
    patch.fileFormat = meta.format === undefined || meta.format === 'unknown'
      ? detectFormat(item.filename)
      : meta.format
  } catch {
    patch.fileFormat = detectFormat(item.filename)
  }

  // -- filename parse ---------------------------------------------------------
  const parsed = parseTimestamp(item.filename, TIMESTAMP_FORMAT_AUTO)

  // -- embedded metadata (WAV only; bounded scan; fail-open) ------------------
  const embedded = patch.fileFormat === 'wav'
    ? await extractEmbeddedTimestamp(file)
    : undefined

  // -- decide the timezone (and the wall time) --------------------------------
  const mode = context.mode
  const siteTz = context.siteTimezone !== undefined && context.siteTimezone !== ''
    ? context.siteTimezone
    : undefined

  let wallTime: string | undefined
  let timestampUtc: string | undefined
  let source: TimezoneSource | undefined
  let zoneName: string | undefined

  // Offset can come from the parsed ISO (explicit %Z formats) or from a
  // token in the raw filename (auto-detect never captures offsets).
  const filenameOffset = parsed !== undefined
    ? (offsetFromIso(parsed) ?? detectFilenameOffset(item.filename))
    : undefined

  if (mode === 'metadata') {
    // FORCED metadata mode (operator 2026-08-13): trust ONLY the recorder's
    // embedded metadata (GUANO / AudioMoth-ICMT). No filename fallback — a
    // forced mode that silently fell back would mislead exactly the user who
    // chose it. Zoneless embedded times are interpreted in the site tz when
    // available (the recorder's clock was almost certainly local), else UTC.
    if (embedded?.wallTime === undefined) {
      patch.analysisError = patch.fileFormat === 'wav'
        ? 'No embedded timestamp found in this file’s metadata (GUANO/ICMT).'
        : 'Metadata scanning only supports WAV files (GUANO/AudioMoth) — choose another timezone method for this file.'
    } else if (embedded.offsetMinutes !== undefined) {
      wallTime = embedded.wallTime
      timestampUtc = applyFixedOffset(embedded.wallTime, embedded.offsetMinutes)
      source = 'file-metadata'
      zoneName = formatOffset(embedded.offsetMinutes)
    } else {
      wallTime = embedded.wallTime
      if (siteTz !== undefined) {
        timestampUtc = toUtcIso(wallTime, siteTz)
        source = 'file-metadata'
        zoneName = siteTz
      } else {
        timestampUtc = toUtcIso(wallTime)
        source = 'file-metadata'
        zoneName = 'UTC'
      }
    }
  } else if (mode === 'auto' && parsed !== undefined && filenameOffset !== undefined) {
    // Rung 1: the filename itself carries an offset.
    wallTime = stripOffset(parsed)
    timestampUtc = applyFixedOffset(wallTime, filenameOffset)
    source = 'filename-offset'
    zoneName = formatOffset(filenameOffset)
  } else if (mode === 'auto' && embedded?.offsetMinutes !== undefined) {
    // Rung 2: recorder metadata with an explicit zone — trust its clock.
    wallTime = embedded.wallTime
    timestampUtc = applyFixedOffset(embedded.wallTime, embedded.offsetMinutes)
    source = 'file-metadata'
    zoneName = formatOffset(embedded.offsetMinutes)
  } else {
    // Rung 3/4 (or forced): a naive wall time interpreted in a zone.
    // Prefer the filename time; else a zoneless embedded time.
    wallTime = parsed !== undefined ? stripOffset(parsed) : embedded?.wallTime
    if (wallTime !== undefined) {
      const useSite = (mode === 'auto' || mode === 'site') && siteTz !== undefined
      if (mode === 'site' && siteTz === undefined) {
        patch.analysisError = 'Site has no timezone configured — choose UTC or Automatic.'
      } else if (useSite) {
        timestampUtc = toUtcIso(wallTime, siteTz)
        source = mode === 'site' ? 'forced-site' : 'site-local'
        zoneName = siteTz
      } else {
        timestampUtc = toUtcIso(wallTime)
        source = mode === 'utc' ? 'forced-utc' : 'utc-fallback'
        zoneName = 'UTC'
      }
    }
  }

  if (patch.analysisError === undefined && (timestampUtc === undefined || wallTime === undefined)) {
    patch.analysisError = parsed === undefined && embedded === undefined
      ? 'No recording timestamp found in the filename or file metadata.'
      : 'Parsed timestamp is not a valid date.'
  }

  // Recorder-provenance check (2026-08-13). Historical recordings ARE allowed
  // — digitised archives legitimately predate 1971 — but a DIGITAL RECORDER
  // cannot, so a pre-1971 date on a file whose own metadata names one means an
  // unset clock (flat battery restarts it at the epoch). Mirrors the server
  // rule so the user learns at STAGING rather than after a failed upload.
  // Advisory: it sets analysisError, which the per-row date editor can fix.
  if (patch.analysisError === undefined && timestampUtc !== undefined) {
    const problem = checkRecordingProvenance({
      timestampUtc,
      metadataEvidence: embedded?.rawMetadata,
      metadataDateUtc: embedded?.wallTime
    })
    if (problem !== undefined) {
      patch.analysisError = problem
    } else {
      // Non-blocking nudge for an old date with no recorder metadata (usually
      // a genuine archive; occasionally a recorder that lost its metadata).
      patch.notice = historicalDateNotice(timestampUtc, embedded?.rawMetadata)
    }
  }

  patch.localWallTime = wallTime
  patch.timestampUtc = timestampUtc
  patch.timezoneSource = source
  patch.timezoneName = zoneName
  patch.siteName = context.siteName

  return { patch }
}

/** Human labels for the "Timezone Determined By" column. */
export const TIMEZONE_SOURCE_LABELS: Record<TimezoneSource, string> = {
  'filename-offset': 'Filename offset',
  'file-metadata': 'File metadata',
  'site-local': 'Site local time',
  'utc-fallback': 'UTC (fallback)',
  'forced-site': 'Site local (selected)',
  'forced-utc': 'UTC (selected)',
  manual: 'Manually edited'
}
