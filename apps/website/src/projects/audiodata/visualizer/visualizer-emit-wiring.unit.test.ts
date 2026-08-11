import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

// WHY THIS TEST EXISTS
// --------------------
// `visualizer-spectrogram.vue` declared a `refreshRecording` emit (the recovery
// path for an expired 6-7h stream-token) but `visualizer-page.vue` never bound
// a listener for it. Vue does not warn about an unheard emit, and tile failures
// in this component are SILENT by construction — `visualizer-tile-img.vue`'s
// `onerror` only calls `done()`, so an unrecovered 401 renders as blank space
// with no console error. "The page looks fine" cannot detect it; only a test can.
//
// This asserts the WIRING CONTRACT: every event the spectrogram declares must
// be bound where it is mounted. It is deliberately a cheap source-level check
// rather than a full mount (d3 + flowbite + provide/inject make mounting this
// component expensive and brittle for what is really a template-binding fact).

const here = dirname(fileURLToPath(import.meta.url))
const read = (relative: string): string => readFileSync(join(here, relative), 'utf8')

/** `(e: 'fooBar', ...)` -> `fooBar` */
const declaredEmits = (source: string): string[] => {
  const block = /defineEmits<\{(.+?)\}>\(\)/s.exec(source)
  if (block === null) return []
  return [...block[1].matchAll(/\(\s*e\s*:\s*'([^']+)'/g)].map(m => m[1])
}

/** camelCase -> kebab-case, the form a template listener uses */
const toKebab = (name: string): string => name.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)

test('every event the spectrogram emits is bound by the page that mounts it', () => {
  const child = read('./components/visualizer-spectrogram.vue')
  const parent = read('./visualizer-page.vue')

  const emits = declaredEmits(child)
  // guard against the regex silently matching nothing and the test passing vacuously
  expect(emits.length).toBeGreaterThan(0)
  expect(emits).toContain('refreshRecording')

  const mountTag = /<VisualizerSpectrogram\b[\s\S]*?\/>/.exec(parent)?.[0]
  expect(mountTag).toBeDefined()

  for (const emitName of emits) {
    const kebab = toKebab(emitName)
    const bound = mountTag?.includes(`@${kebab}=`) === true || mountTag?.includes(`@${emitName}=`) === true
    expect(bound, `<VisualizerSpectrogram> does not bind @${kebab} — the emit is a silent no-op`).toBe(true)
  }
})

test('a tile load failure can actually reach the page (token-refresh path is connected)', () => {
  const tile = read('./components/visualizer-tile-img.vue')
  const child = read('./components/visualizer-spectrogram.vue')

  // tile -> spectrogram
  expect(declaredEmits(tile)).toContain('loadError')
  expect(tile).toMatch(/onerror[\s\S]{0,120}emits\('loadError'\)/)
  expect(child).toMatch(/@load-error=/)

  // spectrogram -> page, once-only so a genuine failure cannot become a loop
  expect(child).toMatch(/emits\('refreshRecording'\)/)
  expect(child).toMatch(/if \(tokenRefreshed\.value\) return/)
})
