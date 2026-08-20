import { expect, test } from 'vitest'

import { AUTO_PAGE_SOURCE_PX_BUDGET, autoTileWidthCeiling, buildTileRenderAttrs, DEFAULT_TILE_HEIGHT, DEFAULT_TILE_QUALITY, DEFAULT_TILE_WIDTH, MAX_AUTO_TILE_WIDTH, MAX_UPSCALE, resolveTileHeight, resolveTileWidth, TILE_QUALITY_TIERS, TILE_WIDTH_STEPS, tileQualityWidth } from './tile-resolution'

// Behaviour tests for the tile-resolution policy.
//
// These run in CI via `pnpm test:unit` (vitest picks up `.unit.test.`). An
// earlier revision of this file was a hand-rolled `.mjs` script that had to be
// invoked by hand against the compiled `lib/` output — it tripped 12 eslint
// errors (no-console et al) and, more importantly, NEVER RAN IN CI, so the
// policy below was only as safe as somebody remembering to run it.

test('never regresses below the shipped default', () => {
  // zoom 0 (a ~100px-wide tile) must not drop to 256 to "save bytes"
  expect(resolveTileWidth(100)).toBe(DEFAULT_TILE_WIDTH)
  expect(resolveTileWidth(0)).toBe(DEFAULT_TILE_WIDTH)
  expect(resolveTileWidth(Number.NaN)).toBe(DEFAULT_TILE_WIDTH)
  expect(resolveTileWidth(-5)).toBe(DEFAULT_TILE_WIDTH)
})

test('zoom-aware escalation is capped at the AUTO ceiling', () => {
  // measured display widths at zoom 0/.25/.5/.75/1 for a real 60s recording
  const cases: Array<[number, number]> = [[100, 512], [1269, 1024], [2437, 1024], [3606, 1024], [4774, 1024]]

  for (const [display, expected] of cases) {
    expect(resolveTileWidth(display)).toBe(expected)
  }

  // without an explicit preference a user can never silently pull ~20 MiB/page
  for (const [display] of cases) {
    expect(resolveTileWidth(display)).toBeLessThanOrEqual(MAX_AUTO_TILE_WIDTH)
  }
})

test('the <=2x upscale guarantee holds until the ceiling', () => {
  expect(resolveTileWidth(1024)).toBe(512) // exactly 2x, no step up needed
  expect(resolveTileWidth(1025)).toBe(1024) // would exceed 2x at 512

  for (const display of [100, 512, 1024, 1269, 2048]) {
    const width = resolveTileWidth(display)
    if (width < MAX_AUTO_TILE_WIDTH) {
      expect(display / width).toBeLessThanOrEqual(MAX_UPSCALE)
    }
  }
})

test('an explicit user preference may exceed the AUTO ceiling', () => {
  expect(resolveTileWidth(100, 2048)).toBe(2048)
  expect(resolveTileWidth(100, 4096)).toBe(4096)
  // a preference is a FLOOR, not a ceiling: zoom may still raise it
  expect(resolveTileWidth(8000, 2048)).toBe(4096)
  // ...but it can never make things worse than the default
  expect(resolveTileWidth(100, 256)).toBe(DEFAULT_TILE_WIDTH)
})

test('height is clamped to the server cap of 1024', () => {
  expect(resolveTileHeight()).toBe(DEFAULT_TILE_HEIGHT)
  expect(resolveTileHeight(256)).toBe(256)
  expect(resolveTileHeight(512)).toBe(512)
  // media-api's checkAttrsValidity 400s above 1024
  expect(resolveTileHeight(2048)).toBe(1024)
})

test('quantisation keeps the media-api cache-key cardinality tiny', () => {
  const widths = new Set<number>()
  for (let display = 1; display <= 6000; display += 7) {
    widths.add(resolveTileWidth(display))
  }

  for (const width of widths) {
    expect(TILE_WIDTH_STEPS).toContain(width)
  }
  expect(widths.size).toBeLessThanOrEqual(TILE_WIDTH_STEPS.length)
})

test('the quality tiers map onto the quantised ladder and stay affordable', () => {
  // every offered tier must be a real ladder step -- an off-ladder width would
  // add a whole new family of entries to the media-api durable cache
  for (const tier of TILE_QUALITY_TIERS) {
    expect(TILE_WIDTH_STEPS).toContain(tier.width)
  }

  // 4096 is deliberately NOT offered: measured 25.38 MiB/page for an 11-tile
  // recording, because the visualizer renders the full tile set with no
  // virtualisation. If someone adds it, this test should make them argue for it.
  expect(TILE_QUALITY_TIERS.map(t => t.width)).toEqual([512, 1024, 2048])

  // the default tier must be today's shipped behaviour, not a silent upgrade
  expect(tileQualityWidth(DEFAULT_TILE_QUALITY)).toBe(DEFAULT_TILE_WIDTH)
})

test('an unknown or absent stored preference degrades to the default tier', () => {
  // localStorage can hold anything a previous build or a user wrote
  expect(tileQualityWidth(undefined)).toBe(DEFAULT_TILE_WIDTH)
  expect(tileQualityWidth(null)).toBe(DEFAULT_TILE_WIDTH)
  expect(tileQualityWidth('')).toBe(DEFAULT_TILE_WIDTH)
  expect(tileQualityWidth('ludicrous')).toBe(DEFAULT_TILE_WIDTH)
})

test('choosing a tier never acts as a ceiling on zoom escalation', () => {
  // THE LOAD-BEARING PROPERTY OF THE CONTROL. A preference raises the FLOOR and
  // unlocks the ladder; it must never PREVENT the zoom-aware floor from
  // sharpening. If 'standard' capped at 512, picking it would silently disable
  // the feature this module exists for -- and tiles would merely look softer,
  // so nobody would report it.
  expect(resolveTileWidth(100, tileQualityWidth('standard'))).toBe(resolveTileWidth(100))
  expect(resolveTileWidth(2437, tileQualityWidth('standard'))).toBe(resolveTileWidth(2437))
  expect(resolveTileWidth(2437, tileQualityWidth('standard'))).toBe(MAX_AUTO_TILE_WIDTH)

  // a higher tier floors higher...
  expect(resolveTileWidth(100, tileQualityWidth('high'))).toBe(1024)
  expect(resolveTileWidth(100, tileQualityWidth('maximum'))).toBe(2048)
  // ...and still escalates beyond the auto ceiling when zoomed right in
  expect(resolveTileWidth(4774, tileQualityWidth('maximum'))).toBe(4096)
})

test('the AUTO ceiling is tile-count-aware and spends a constant page budget', () => {
  // the flat cap assumed ~11 tiles; the budget IS 11x1024
  expect(AUTO_PAGE_SOURCE_PX_BUDGET).toBe(11 * MAX_AUTO_TILE_WIDTH)

  // fewer tiles -> higher per-tile ceiling, same accepted page cost
  expect(autoTileWidthCeiling(1)).toBe(4096)
  expect(autoTileWidthCeiling(2)).toBe(4096)
  expect(autoTileWidthCeiling(3)).toBe(2048)
  expect(autoTileWidthCeiling(5)).toBe(2048)
  expect(autoTileWidthCeiling(6)).toBe(1024)
  expect(autoTileWidthCeiling(11)).toBe(1024)
  expect(autoTileWidthCeiling(40)).toBe(1024) // never below the flat cap

  // page cost never exceeds the budget the 1024 cap accepted
  for (const count of [1, 2, 3, 4, 5, 6, 8, 11, 20]) {
    expect(count * autoTileWidthCeiling(count)).toBeLessThanOrEqual(
      Math.max(AUTO_PAGE_SOURCE_PX_BUDGET, count * MAX_AUTO_TILE_WIDTH)
    )
  }

  // unknown/invalid counts degrade to the flat cap -- every caller that does
  // not pass a count keeps today's behaviour exactly
  expect(autoTileWidthCeiling()).toBe(MAX_AUTO_TILE_WIDTH)
  expect(autoTileWidthCeiling(0)).toBe(MAX_AUTO_TILE_WIDTH)
  expect(autoTileWidthCeiling(-1)).toBe(MAX_AUTO_TILE_WIDTH)
  expect(autoTileWidthCeiling(Number.NaN)).toBe(MAX_AUTO_TILE_WIDTH)
})

test('a lone tile regains the <=2x upscale invariant the seams fix broke', () => {
  // THE CASE THIS EXISTS FOR: rec 311378544 (0.963s) post-seams-fix renders as
  // ONE tile displayed at ~2244px. Under the flat cap that is 1024 source px
  // -> 2.19x upscale, violating MAX_UPSCALE on the automatic path. With the
  // real count supplied the ladder may spend the page budget on the lone tile.
  expect(resolveTileWidth(2244, undefined, 1)).toBe(2048)
  expect(2244 / resolveTileWidth(2244, undefined, 1)).toBeLessThanOrEqual(MAX_UPSCALE)

  // a 2-tile short recording (e.g. a 10s clip -> 1720px base) behaves too
  expect(resolveTileWidth(2244, undefined, 2)).toBe(2048)

  // an 11-tile recording is byte-identical to the un-counted path: no silent
  // behaviour change for the recordings the 1024 cap was designed around
  for (const display of [100, 1269, 2437, 3606, 4774]) {
    expect(resolveTileWidth(display, undefined, 11)).toBe(resolveTileWidth(display))
  }

  // the default floor still holds at zoom 0 regardless of count
  expect(resolveTileWidth(100, undefined, 1)).toBe(DEFAULT_TILE_WIDTH)

  // an explicit user preference still unlocks the full ladder
  expect(resolveTileWidth(8000, 2048, 1)).toBe(4096)
})

test('render attrs match the media-api filename grammar', () => {
  expect(buildTileRenderAttrs('mtrue', 512, 1024)).toBe('z95_wdolph_g1_fspec_mtrue_d512.1024.png')
  // palette is passed through verbatim — it is unsigned by design
  expect(buildTileRenderAttrs('mfalse_p2', 1024, 1024)).toBe('z95_wdolph_g1_fspec_mfalse_p2_d1024.1024.png')
})
