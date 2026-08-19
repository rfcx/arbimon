/**
 * Segment model for the filename-format field.
 *
 * The field is no longer a plain text input: tokens render as bordered chips
 * that can be dragged in from the palette and reordered in place, while the
 * literal text between them stays freely typeable. That needs a structured
 * representation, but the PERSISTED value is still the plain `%`-token string —
 * this module is the (lossless) bridge between the two.
 *
 * INVARIANT — the array always ALTERNATES text/token/text/…, starting and
 * ending with a text segment (possibly empty). Empty text segments are what
 * give the user somewhere to place the caret between two adjacent chips; without
 * them, `%Y%M` would be two chips with no way to type a separator between them.
 * `normalize()` restores this shape after every mutation, so every other
 * function can assume it.
 *
 * Kept in the website rather than the engine on purpose: this is a presentation
 * concern (how a format is EDITED), not a parsing concern (what a format MEANS).
 * The engine stays dependency-free and unaware of the editor.
 */

export interface FormatSegment {
  kind: 'text' | 'token'
  value: string
}

/**
 * Split a format string into segments.
 *
 * Uses the same `%%|%.` rule as the engine's own tokenizer, so `%%` (an escaped
 * literal percent) stays TEXT and is never shown as a draggable chip — it is not
 * a token, and letting a user drag it would imply it could be reordered
 * meaningfully.
 */
export const parseFormatSegments = (format: string): FormatSegment[] => {
  const segments: FormatSegment[] = []
  const pattern = /%%|%./g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(format)) !== null) {
    if (match[0] === '%%') continue // escaped percent: leave it in the text run
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', value: format.slice(lastIndex, match.index) })
    }
    segments.push({ kind: 'token', value: match[0] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < format.length) {
    segments.push({ kind: 'text', value: format.slice(lastIndex) })
  }
  return normalize(segments)
}

/** Serialize back to the persisted format string. Empty text adds nothing. */
export const segmentsToFormat = (segments: FormatSegment[]): string =>
  segments.map(segment => segment.value).join('')

/**
 * Restore the alternating invariant: merge adjacent text runs, and ensure a
 * text segment exists at both ends and between every pair of tokens.
 */
export const normalize = (segments: FormatSegment[]): FormatSegment[] => {
  const merged: FormatSegment[] = []
  for (const segment of segments) {
    if (segment.kind === 'token') { merged.push({ ...segment }); continue }
    const previous = merged[merged.length - 1]
    if (previous !== undefined && previous.kind === 'text') {
      previous.value += segment.value
    } else {
      merged.push({ ...segment })
    }
  }

  const out: FormatSegment[] = []
  if (merged.length === 0 || merged[0].kind === 'token') out.push({ kind: 'text', value: '' })
  for (const segment of merged) {
    const previous = out[out.length - 1]
    if (segment.kind === 'token' && previous !== undefined && previous.kind === 'token') {
      out.push({ kind: 'text', value: '' })
    }
    out.push(segment)
  }
  const last = out[out.length - 1]
  if (last === undefined || last.kind === 'token') out.push({ kind: 'text', value: '' })
  return out
}

/**
 * Insert a token at a segment index (the index it should END UP at).
 * Index is clamped, so a drop past the last chip appends rather than throwing.
 */
export const insertTokenAt = (
  segments: FormatSegment[],
  token: string,
  atIndex: number
): FormatSegment[] => {
  const next = segments.map(segment => ({ ...segment }))
  const clamped = Math.max(0, Math.min(atIndex, next.length))
  next.splice(clamped, 0, { kind: 'token', value: token })
  return normalize(next)
}

/** Remove the segment at `index` (used by a chip's × control). */
export const removeSegmentAt = (segments: FormatSegment[], index: number): FormatSegment[] => {
  if (index < 0 || index >= segments.length) return normalize(segments.map(s => ({ ...s })))
  const next = segments.map(segment => ({ ...segment }))
  next.splice(index, 1)
  return normalize(next)
}

/**
 * Move the token at `fromIndex` so it lands at insertion point `toIndex`.
 *
 * `toIndex` is expressed against the ORIGINAL array (it comes from hit-testing
 * the rendered chips), so removing the dragged segment first would shift every
 * later position by one. Compensating here rather than at the call site keeps
 * that off-by-one in ONE place — it is the classic bug in drag reordering.
 */
export const moveSegment = (
  segments: FormatSegment[],
  fromIndex: number,
  toIndex: number
): FormatSegment[] => {
  if (fromIndex < 0 || fromIndex >= segments.length) return normalize(segments.map(s => ({ ...s })))
  const next = segments.map(segment => ({ ...segment }))
  const [moved] = next.splice(fromIndex, 1)
  const adjusted = toIndex > fromIndex ? toIndex - 1 : toIndex
  next.splice(Math.max(0, Math.min(adjusted, next.length)), 0, moved)
  return normalize(next)
}

/**
 * Where should the caret go when an arrow key is pressed inside a text segment?
 *
 * A TOKEN IS ONE CHARACTER for navigation purposes (operator, 2026-08-19): the
 * caret never lands "inside" a chip, it steps over it in a single press. Because
 * segments always alternate text/token/text, stepping over a token means moving
 * to the NEIGHBOURING TEXT SEGMENT and landing on its near edge.
 *
 * Returns the segment to focus and the caret offset within it, or `undefined`
 * when the key should keep its default behaviour (moving within the current
 * text, or doing nothing at the very ends of the field).
 *
 * Pure so the rules are testable without a DOM: the component only has to apply
 * the result.
 *
 * @param segments   current segments (assumed normalized)
 * @param index      segment index the caret is in (a text segment)
 * @param offset     caret offset within that text
 * @param direction  'left' or 'right'
 */
export const caretTargetForArrow = (
  segments: FormatSegment[],
  index: number,
  offset: number,
  direction: 'left' | 'right'
): { index: number, offset: number } | undefined => {
  const current = segments[index]
  if (current === undefined || current.kind !== 'text') return undefined

  if (direction === 'left') {
    // Only take over at the very start of the text run; otherwise the browser's
    // own character-wise movement is correct.
    if (offset > 0) return undefined
    const token = segments[index - 1]
    const previousText = segments[index - 2]
    if (token === undefined || previousText === undefined) return undefined
    // Land at the END of the text before the token -- i.e. just left of the chip.
    return { index: index - 2, offset: previousText.value.length }
  }

  if (offset < current.value.length) return undefined
  const token = segments[index + 1]
  const nextText = segments[index + 2]
  if (token === undefined || nextText === undefined) return undefined
  // Land at the START of the text after the token -- i.e. just right of the chip.
  return { index: index + 2, offset: 0 }
}

/**
 * Which insertion index does a pointer at `x` correspond to?
 *
 * Compares against each candidate's horizontal MIDPOINT: past the midpoint means
 * "after this one". Pixel-based rather than derived from DOM order because the
 * field wraps across lines, and index arithmetic alone cannot tell which side of
 * a chip the pointer is on. (This repo has been bitten before by a grid-index
 * probe that disagreed with the pixels; the pixels were right.)
 */
export const insertIndexForX = (
  rects: Array<{ index: number, left: number, width: number }>,
  x: number
): number => {
  for (const rect of rects) {
    if (x < rect.left + rect.width / 2) return rect.index
  }
  const last = rects[rects.length - 1]
  return last === undefined ? 0 : last.index + 1
}
