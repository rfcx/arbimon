/**
 * Embedded recording-timestamp extraction from WAV headers.
 *
 * Two sources, in confidence order:
 *  1. GUANO (`guan` chunk) `Timestamp:` field — the bioacoustics metadata
 *     standard (AudioMoth ≥1.4, SM4, Anabat…). May carry a UTC offset.
 *  2. AudioMoth `LIST/INFO` `ICMT` comment — "Recorded at HH:MM:SS DD/MM/YYYY
 *     (UTC[±H[:MM]]) by AudioMoth <id>". Always carries a zone statement.
 *
 * Bounded header scan (same discipline as wav-metadata.ts): reads only the
 * first `scanLimit` bytes, walks chunks, never touches audio payload.
 * Everything here FAILS OPEN — any malformed field returns undefined and the
 * caller falls through to the next timezone rung.
 */

export interface EmbeddedTimestamp {
  /** Wall-clock time as written by the recorder: `YYYY-MM-DDTHH:mm:ss` */
  wallTime: string
  /** UTC offset in minutes when the metadata stated one (0 = UTC). */
  offsetMinutes?: number
  source: 'guano' | 'icmt'
}

const ascii = new TextDecoder('ascii')
const utf8 = new TextDecoder('utf-8')

const fourcc = (view: DataView, offset: number): string =>
  ascii.decode(new Uint8Array(view.buffer, view.byteOffset + offset, 4))

const pad2 = (n: string | number): string => String(n).padStart(2, '0')

/** Parse a GUANO `Timestamp:` value → EmbeddedTimestamp. */
export const parseGuanoTimestamp = (value: string): EmbeddedTimestamp | undefined => {
  // Forms seen in the wild: 2018-03-01T12:00:00 | ...T12:00:00.123 |
  // ...T12:00:00-07:00 | ...T12:00:00Z | date-space-time variants.
  const m = value.trim().match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/
  )
  if (m === null) return undefined
  const [, y, mo, d, h, mi, s, zone] = m
  const wallTime = `${y}-${mo}-${d}T${h}:${mi}:${s}`
  if (zone === undefined) return { wallTime, source: 'guano' }
  if (zone === 'Z') return { wallTime, offsetMinutes: 0, source: 'guano' }
  const zm = zone.match(/^([+-])(\d{2}):?(\d{2})$/)
  if (zm === null) return { wallTime, source: 'guano' }
  const sign = zm[1] === '-' ? -1 : 1
  return {
    wallTime,
    offsetMinutes: sign * (parseInt(zm[2]) * 60 + parseInt(zm[3])),
    source: 'guano'
  }
}

/** Parse an AudioMoth ICMT comment → EmbeddedTimestamp. */
export const parseAudioMothComment = (comment: string): EmbeddedTimestamp | undefined => {
  // "Recorded at 19:30:00 18/08/2025 (UTC) by AudioMoth ..." with zone forms
  // (UTC), (UTC-7), (UTC+5:30). Date is DD/MM/YYYY.
  const m = comment.match(
    /Recorded at (\d{2}):(\d{2}):(\d{2})(?:\.\d+)? (\d{2})\/(\d{2})\/(\d{4}) \(UTC([+-]\d{1,2})?(?::(\d{2}))?\)/
  )
  if (m === null) return undefined
  const [, h, mi, s, d, mo, y, offH, offM] = m
  const wallTime = `${y}-${mo}-${d}T${h}:${mi}:${s}`
  let offsetMinutes = 0
  if (offH !== undefined) {
    const hours = parseInt(offH)
    const mins = offM !== undefined ? parseInt(offM) : 0
    // (UTC-7:30) means -(7h30m): the sign applies to the whole offset
    offsetMinutes = hours < 0 ? hours * 60 - mins : hours * 60 + mins
  }
  return { wallTime, offsetMinutes, source: 'icmt' }
}

/**
 * Scan a WAV blob's header for an embedded timestamp.
 * Returns the GUANO timestamp when present (higher confidence), else the
 * AudioMoth ICMT one, else undefined. Non-WAV containers return undefined.
 */
export async function extractEmbeddedTimestamp (
  blob: Blob,
  scanLimit = 1024 * 1024
): Promise<EmbeddedTimestamp | undefined> {
  try {
    const head = new DataView(
      await blob.slice(0, Math.min(scanLimit, blob.size)).arrayBuffer()
    )
    if (head.byteLength < 12) return undefined
    const riffId = fourcc(head, 0)
    if ((riffId !== 'RIFF' && riffId !== 'RF64') || fourcc(head, 8) !== 'WAVE') {
      return undefined
    }

    let guano: EmbeddedTimestamp | undefined
    let icmt: EmbeddedTimestamp | undefined

    let offset = 12
    while (offset + 8 <= head.byteLength) {
      const id = fourcc(head, offset)
      const size = head.getUint32(offset + 4, true)
      const bodyStart = offset + 8
      const bodyEnd = Math.min(bodyStart + size, head.byteLength)

      if (id === 'guan' && bodyEnd > bodyStart) {
        const text = utf8.decode(
          new Uint8Array(head.buffer, head.byteOffset + bodyStart, bodyEnd - bodyStart)
        )
        // GUANO is "Key:Value\n" lines (keys may be namespaced a|b)
        const line = text
          .split('\n')
          .map(l => l.trim())
          .find(l => /^Timestamp:/i.test(l))
        if (line !== undefined) {
          guano = parseGuanoTimestamp(line.slice(line.indexOf(':') + 1))
        }
      }

      if (id === 'LIST' && bodyEnd >= bodyStart + 4 &&
          fourcc(head, bodyStart) === 'INFO') {
        // walk INFO sub-chunks for ICMT
        let sub = bodyStart + 4
        while (sub + 8 <= bodyEnd) {
          const subId = fourcc(head, sub)
          const subSize = head.getUint32(sub + 4, true)
          if (subId === 'ICMT') {
            const text = utf8.decode(
              new Uint8Array(
                head.buffer,
                head.byteOffset + sub + 8,
                Math.min(subSize, bodyEnd - sub - 8)
              )
            ).replace(/\0+$/, '')
            icmt = parseAudioMothComment(text)
            break
          }
          sub += 8 + subSize + (subSize % 2)
        }
      }

      if (id === 'data') break
      offset += 8 + size + (size % 2)
    }

    return guano ?? icmt
  } catch {
    return undefined // fail open: no embedded timestamp
  }
}

/** Format an offset in minutes as `+HH:MM` / `-HH:MM` / `UTC`. */
export const formatOffset = (offsetMinutes: number): string => {
  if (offsetMinutes === 0) return 'UTC'
  const sign = offsetMinutes < 0 ? '-' : '+'
  const abs = Math.abs(offsetMinutes)
  return `${sign}${pad2(Math.floor(abs / 60))}:${pad2(abs % 60)}`
}