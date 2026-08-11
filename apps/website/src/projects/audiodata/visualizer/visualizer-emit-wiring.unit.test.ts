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

test('the quality control is wired end to end, sidebar -> page -> spectrogram', () => {
  // Four components sit between the button and the tiles. A break anywhere in
  // the chain leaves the control looking functional while doing nothing --
  // the same silent-no-op class as the refreshRecording emit above.
  const controls = read('./components/sidebar-controls.vue')
  const player = read('./components/sidebar-spectrogram-player.vue')
  const sidebar = read('./components/visualizer-sidebar.vue')
  const page = read('./visualizer-page.vue')
  const spectrogram = read('./components/visualizer-spectrogram.vue')

  // 1. the control emits, and persists the choice
  expect(declaredEmits(controls)).toContain('emitTileQuality')
  expect(controls).toMatch(/emit\('emitTileQuality', tierId\)/)
  expect(controls).toMatch(/setTileQuality\(tierId\)/)

  // 2. every hop re-emits it
  expect(player).toMatch(/@emit-tile-quality=/)
  expect(declaredEmits(player)).toContain('updateTileQuality')
  expect(sidebar).toMatch(/@update-tile-quality=/)
  expect(declaredEmits(sidebar)).toContain('updateTileQuality')

  // 3. the page binds the listener AND passes the value down as a prop
  expect(page).toMatch(/@update-tile-quality="handleTileQuality"/)
  expect(page).toMatch(/:tile-quality="tileQuality"/)

  // 4. the spectrogram reacts to it
  expect(spectrogram).toMatch(/tileQuality\?: TileQualityTierId/)
  expect(spectrogram).toMatch(/watch\(\(\) => props\.tileQuality/)
})

test('changing quality must NOT trigger a recording refetch', () => {
  // The palette control refetches (handleColorSpectrogram -> refetchRecording),
  // which re-runs recordings/info and the server-side Jimp tiling. Quality must
  // not: the stream-token signs the source WINDOW, not the render size, so tiles
  // re-derive from the same credential with no round-trip. Wiring quality into a
  // refetch would still LOOK correct on screen -- only slower and more costly --
  // so only a test can hold this line.
  const page = read('./visualizer-page.vue')
  const handler = /const handleTileQuality = \([\s\S]{0,240}?\n}/.exec(page)?.[0]
  expect(handler).toBeDefined()
  expect(handler).not.toMatch(/refetchRecording/)
  expect(handler).not.toMatch(/isFetchingVisobject/)
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
