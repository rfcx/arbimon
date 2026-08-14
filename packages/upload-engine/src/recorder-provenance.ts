/**
 * Client-side mirror of the server's recorder-provenance rule
 * (rfcx/ingest-service `utils/recorder-provenance.js`).
 *
 * WHY THIS EXISTS
 * ---------------
 * Historical recordings ARE supported: digitised tape/archive material with a
 * genuine pre-1971 date is legitimate, and the storage layer represents it
 * natively (production already holds ~551 such segments). What must still be
 * caught is an UNSET RECORDER CLOCK — a digital recorder whose dead battery
 * restarted it at the Unix epoch, producing a burst of files stamped
 * 1970-01-01 onwards.
 *
 * The discriminator is PROVENANCE, not the date: digital field recorders did
 * not exist before 1971, so a file whose OWN metadata names one cannot
 * genuinely predate that. A digitised archive carries no such metadata.
 *
 * Measured on production (2026-08-13, 229,024 pre-1971 segments):
 *   epoch-drift window (12-31..01-14)  220,985 segments  59.0% recorder-tagged
 *   rest of 1970                         7,321 segments  95.7% recorder-tagged
 *   plausible historical (1900..1969)      551 segments   0.4% recorder-tagged
 *   absurd (< 1900)                        167 segments   0.0% recorder-tagged
 *
 * WHY NOT A DATE WINDOW: blocking 1969-12-31..1970-01-14 outright would
 * destroy genuine archival uploads — real xeno-canto recordings sit inside
 * that window with placeholder dates (e.g.
 * `ChestnutRumpedBabblerXC360083dt19700101_000000.wav`).
 *
 * CLIENT vs SERVER: the server is authoritative, but it can only apply the
 * provenance rule at INGEST (it has no file bytes at sign time). Running the
 * same check here means the user is told at STAGING — before spending an
 * upload — and gets an actionable message instead of a late failure. This is
 * advisory: it sets `analysisError`, which the user can correct with the
 * per-row date editor.
 */

/** Signatures of digital field recorders (kept in step with the server). */
const RECORDER_SIGNATURES: Array<{ pattern: RegExp, name: string }> = [
  { pattern: /AudioMoth/i, name: 'AudioMoth' },
  { pattern: /GUANO/, name: 'a bioacoustic recorder (GUANO metadata)' },
  { pattern: /Song\s?Meter/i, name: 'Song Meter' },
  { pattern: /Wildlife\s?Acoustics/i, name: 'Wildlife Acoustics' },
  { pattern: /SongMeter/i, name: 'Song Meter' },
  { pattern: /Swift\s?Recorder/i, name: 'Swift' },
  { pattern: /Avisoft/i, name: 'Avisoft-RECORDER' },
  { pattern: /Zoom\s+H[1-9]/i, name: 'Zoom handheld recorder' }
]

/** Sound recording predates this by decades; anything older is a parse bug. */
export const MIN_RECORDING_YEAR = 1800

/** A digital recorder cannot have produced audio before this year. */
export const MIN_DIGITAL_RECORDER_YEAR = 1971

/**
 * Identify the digital recorder named by a file's embedded metadata.
 * `evidence` is any text pulled from the file itself (GUANO block, AudioMoth
 * ICMT comment) — NOT the filename, which the user may have renamed.
 */
export const detectRecorder = (evidence: string | undefined): string | undefined => {
  if (evidence === undefined || evidence === '') return undefined
  for (const sig of RECORDER_SIGNATURES) {
    if (sig.pattern.test(evidence)) return sig.name
  }
  return undefined
}

export interface ProvenanceCheckInput {
  /** The resolved recording instant (UTC ISO) we intend to upload. */
  timestampUtc: string
  /** Raw text extracted from the file's own metadata, if any. */
  metadataEvidence?: string
  /** A date embedded in the file's metadata (UTC ISO), when one exists. */
  metadataDateUtc?: string
}

/**
 * Returns a human-readable problem, or undefined when the timestamp is fine.
 * Mirrors the server's decision ladder so the two cannot disagree.
 */
export const checkRecordingProvenance = (
  input: ProvenanceCheckInput
): string | undefined => {
  const date = new Date(input.timestampUtc)
  if (isNaN(date.getTime())) return undefined // other validation owns this

  const year = date.getUTCFullYear()

  // 1. Absurdity floor — a misread filename, not a recording.
  if (year < MIN_RECORDING_YEAR) {
    return `The date reads as ${input.timestampUtc.slice(0, 10)}, which is not a plausible recording date — the filename’s date format is probably being misread.`
  }

  // 2. Provenance: a digital recorder cannot predate its own existence.
  if (year < MIN_DIGITAL_RECORDER_YEAR) {
    const recorder = detectRecorder(input.metadataEvidence)
    if (recorder !== undefined) {
      return `This file’s metadata says it was recorded by ${recorder}, so it cannot date from ${year} — the recorder’s clock was most likely unset (a flat battery restarts it at 1 Jan 1970). Correct the date below, or fix the recorder’s clock and re-copy the files.`
    }
  }

  // 3. Metadata contradiction — catches misparsed filenames of ANY brand.
  if (input.metadataDateUtc !== undefined) {
    const metaDate = new Date(input.metadataDateUtc)
    if (!isNaN(metaDate.getTime())) {
      const driftDays = Math.abs(date.getTime() - metaDate.getTime()) / 86_400_000
      if (driftDays > 366) {
        return `The date reads as ${input.timestampUtc.slice(0, 10)}, but the file’s own metadata says ${input.metadataDateUtc.slice(0, 10)} — the filename’s date format is probably being misread.`
      }
    }
  }

  return undefined
}

/**
 * Advisory (non-blocking) note for an unusually old recording that carries NO
 * recorder metadata. These are usually genuine digitised archives, so this
 * must NOT block the upload — but a flat-battery recorder that also stripped
 * its metadata lands here too, so it is worth a visible nudge.
 */
export const historicalDateNotice = (
  timestampUtc: string,
  metadataEvidence?: string
): string | undefined => {
  const date = new Date(timestampUtc)
  if (isNaN(date.getTime())) return undefined
  const year = date.getUTCFullYear()
  if (year >= MIN_DIGITAL_RECORDER_YEAR) return undefined
  if (detectRecorder(metadataEvidence) !== undefined) return undefined // rejected above
  return `Unusually old date (${year}). This is fine for digitised archive recordings — but if these came from a digital recorder, check its clock.`
}
