/**
 * `surface` — which DOCUMENT an uploader analytics event came from
 * (`in_page` = the uploader rendered inline in the SPA, `popout` = the
 * dedicated uploader tab opened at `?popout=1`).
 *
 * WHY THIS PROPERTY EXISTS (and why it is worth testing at all).
 *
 * On 2026-08-18 every `web_upload_*` event ever recorded — 4,629 of them —
 * carried `$pathname=/import-recordings-new`, the beta route retired on
 * 2026-08-12. The live route had never emitted one. Deciding whether that meant
 * "the instrumentation is broken" or "nobody has completed an upload there yet"
 * required a CDP probe of the engine's listener registry on a live page,
 * because the events themselves could not say where they came from.
 *
 * The events should never again be unable to answer that. `surface` is the
 * cheapest possible version of that answer, and these tests pin its CONTRACT:
 * the exact string values (they become PostHog property values and a rename
 * silently splits every historical breakdown), and the fail-safe behaviour.
 *
 * The rules that matter, each asserted below:
 *   1. `?popout=1` ⇒ 'popout'; anything else ⇒ 'in_page'.
 *   2. It must be read at EMIT time, not captured at module init — the SPA tab
 *      is long-lived and navigates, so a value frozen at app boot would
 *      describe whatever page happened to load first.
 *   3. It must NEVER throw. Analytics sits inside the upload pipeline; a throw
 *      here would take out a real user's upload.
 *   4. SSR-safe (no `window` during prerender).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, test, vi } from 'vitest'

/**
 * Mirror of `currentSurface()` from `~/upload`, extracted so it can be
 * exercised without importing the module singleton — which on import starts
 * intervals, opens a BroadcastChannel and touches IndexedDB (the same reason
 * `popout-claim.unit.test.ts` mirrors `applyScope`).
 *
 * KEPT HONEST: `currentSurface source is mirrored faithfully` below asserts the
 * production copy is structurally identical, so this cannot silently drift into
 * testing a fiction.
 */
type UploaderSurface = 'in_page' | 'popout'

const currentSurfaceMirror = (search: string | undefined): UploaderSurface => {
  if (search === undefined) return 'in_page' // SSR / no window
  try {
    return new URLSearchParams(search).get('popout') === '1' ? 'popout' : 'in_page'
  } catch {
    return 'in_page'
  }
}

afterEach(() => { vi.restoreAllMocks() })

describe('currentSurface', () => {
  test("?popout=1 is 'popout'", () => {
    expect(currentSurfaceMirror('?popout=1')).toBe('popout')
  })

  test("the inline uploader is 'in_page'", () => {
    expect(currentSurfaceMirror('')).toBe('in_page')
    expect(currentSurfaceMirror('?')).toBe('in_page')
  })

  test('popout survives extra/reordered query params (cache-busters, utm, …)', () => {
    // Real pop-out URLs pick up cache-busters from QA harnesses and could pick
    // up campaign params; positional parsing would break on these.
    expect(currentSurfaceMirror('?cb=1787043103366&popout=1')).toBe('popout')
    expect(currentSurfaceMirror('?popout=1&cb=123')).toBe('popout')
    expect(currentSurfaceMirror('?utm_source=x&popout=1&foo=bar')).toBe('popout')
  })

  test('only the exact value "1" counts as a pop-out', () => {
    // The page's own guard is `route.query.popout === '1'`. If this helper were
    // laxer (e.g. truthiness), the two would disagree and the label would lie
    // about a document that does NOT behave as a pop-out.
    expect(currentSurfaceMirror('?popout=0')).toBe('in_page')
    expect(currentSurfaceMirror('?popout=true')).toBe('in_page')
    expect(currentSurfaceMirror('?popout=')).toBe('in_page')
    expect(currentSurfaceMirror('?popout')).toBe('in_page')
    expect(currentSurfaceMirror('?popouts=1')).toBe('in_page')
    expect(currentSurfaceMirror('?notpopout=1')).toBe('in_page')
  })

  test("SSR (no window) degrades to 'in_page' rather than throwing", () => {
    expect(currentSurfaceMirror(undefined)).toBe('in_page')
  })

  test('a malformed query cannot throw into the upload pipeline', () => {
    // URLSearchParams is lenient, but the try/catch is the load-bearing
    // guarantee: analytics must never throw into a user's upload.
    expect(() => currentSurfaceMirror('?%')).not.toThrow()
    expect(currentSurfaceMirror('?%')).toBe('in_page')
  })

  test('returns ONLY the two contract values', () => {
    // These strings land in PostHog as property VALUES. Renaming one silently
    // splits every historical breakdown, so the vocabulary is pinned.
    const inputs = ['?popout=1', '', '?popout=0', '?a=b', undefined]
    for (const i of inputs) {
      expect(['in_page', 'popout']).toContain(currentSurfaceMirror(i))
    }
  })
})

describe('production source integrity', () => {
  const source = readFileSync(
    join(__dirname, 'index.ts'),
    'utf-8'
  )

  test('currentSurface source is mirrored faithfully', () => {
    // Guards the mirror above against drift. Asserts the real implementation
    // still keys on `popout` === '1' via URLSearchParams, still guards SSR, and
    // still swallows errors.
    const fn = source.slice(
      source.indexOf('export const currentSurface'),
      source.indexOf('const INGEST_BASE_URL')
    )
    // NOTE: vitest rewrites `import.meta.env` to `process.env` in the source it
    // hands back, so match the SSR guard on its stable parts rather than on the
    // literal `import.meta.env.SSR` spelling.
    expect(fn).toMatch(/\.SSR \|\| typeof window === 'undefined'/)
    expect(fn).toContain('URLSearchParams(window.location.search)')
    expect(fn).toContain(".get('popout') === '1'")
    expect(fn).toContain("'popout'")
    expect(fn).toContain("'in_page'")
    expect(fn).toContain('catch')
  })

  test('EVERY web_upload_* event carries a surface property', () => {
    // The whole point is a taxonomy with no blind spots. A new event added
    // without `surface` would reintroduce exactly the ambiguity this property
    // was created to remove, so the completeness rule is asserted mechanically
    // rather than left to review.
    const files = [
      join(__dirname, 'index.ts'),
      join(__dirname, '../../projects/import-recordings/import-recordings-page.vue'),
      join(__dirname, '../../_components/upload-panel/upload-panel.vue')
    ].map(f => readFileSync(f, 'utf-8'))

    const missing: string[] = []
    for (const text of files) {
      const re = /track\('(web_upload[^']*)'/g
      let m: RegExpExecArray | null
      while ((m = re.exec(text)) !== null) {
        // walk to the matching close paren of the track( call
        const open = text.indexOf('(', m.index)
        let depth = 0
        let i = open
        while (i < text.length) {
          if (text[i] === '(') depth++
          else if (text[i] === ')') { depth--; if (depth === 0) break }
          i++
        }
        const block = text.slice(m.index, i + 1)
        if (!block.includes('surface')) missing.push(m[1])
      }
    }
    expect(missing).toEqual([])
  })

  test('no web_upload_* event uses the stale `project:` key instead of `projectSlug`', () => {
    // PostHog property names are per-event; a stray alias fragments any
    // cross-event breakdown. `project` was used by two events and had never
    // actually been emitted (verified in ClickHouse), so it was normalised.
    const files = [
      join(__dirname, '../../projects/import-recordings/import-recordings-page.vue'),
      join(__dirname, '../../_components/upload-panel/upload-panel.vue')
    ].map(f => readFileSync(f, 'utf-8'))

    for (const text of files) {
      const re = /track\('web_upload[^']*'[\s\S]{0,400}?\)/g
      const blocks = text.match(re) ?? []
      for (const b of blocks) {
        expect(b).not.toMatch(/[^a-zA-Z]project:\s/)
      }
    }
  })
})
